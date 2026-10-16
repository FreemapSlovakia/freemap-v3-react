import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { fitLoadedMap, mapToFit } from '@features/map/fitMapToBbox.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import { latLngBounds } from 'leaflet';
import { loadChangesetsMessages } from '../translations/loadChangesetsMessages.js';
import { changesetsInspect, changesetsSetInspected } from './actions.js';
import { changesetDetail } from './changesetDetail.js';
import { parseAdiff, parseChangeset } from './changesetDiff.js';

export const changesetsInspectProcessor: Processor<typeof changesetsInspect> = {
  actionCreator: changesetsInspect,
  handle: async ({ action, dispatch, getState, toastError }) => {
    const id = action.payload;

    if (id === null) {
      return;
    }

    const cancel = {
      getState,
      cancelActions: [changesetsInspect, clearMapFeatures],
      statePredicate: (s: RootState) => !isToolOpen(s, 'changesets'),
    };

    const parser = new DOMParser();

    // OSMCha computes the diff some minutes after the changeset closes.
    const diffPromise = httpRequest({
      ...cancel,
      url: `https://adiffs.osmcha.org/changesets/${id}.adiff`,
      expectedStatus: [200, 404],
    });

    // Awaited below; this only keeps it from going unhandled should the
    // metadata fail first.
    diffPromise.catch(() => undefined);

    try {
      const metaRes = await httpRequest({
        ...cancel,
        url: `${process.env['OSM_API_URL']}/api/0.6/changeset/${id}`,
      });

      const metaEl = parser
        .parseFromString(await metaRes.text(), 'text/xml')
        .querySelector('changeset');

      if (!metaEl) {
        throw new Error(`Changeset ${id} not found`);
      }

      const changeset = parseChangeset(metaEl);

      // The details while the diff, which may be megabytes, loads.
      dispatch(changesetDetail(changeset));

      const diffRes = await diffPromise;

      if (diffRes.status === 404) {
        dispatch(changesetsInspect(null));

        // Ending the inspection took the details; they hold without it.
        dispatch(changesetDetail(changeset));

        dispatch(
          toastsAdd({
            id: 'changeset.diffNotReady',
            messageKey: 'diffNotReady',
            messageLoader: loadChangesetsMessages,
            cancelType: changesetsInspect.type,
            style: 'warning',
          }),
        );

        return;
      }

      const diff = parseAdiff(
        parser.parseFromString(await diffRes.text(), 'text/xml'),
      );

      dispatch(changesetsSetInspected({ changeset, diff }));

      const bounds = latLngBounds(
        diff.flatMap((element) => [
          ...(element.old?.coords ?? []),
          ...(element.new?.coords ?? []),
        ]),
      );

      if (!bounds.isValid()) {
        return;
      }

      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];

      const map = await mapToFit(bbox);

      // Only when off screen, as a changeset picked on the map is already
      // there; and not once another inspection took over while the map loaded.
      if (
        map &&
        getState().changesets.inspected?.id === id &&
        !map.getBounds().contains(bounds)
      ) {
        fitLoadedMap(map, dispatch, bbox, { padding: 40 });
      }
    } catch (err) {
      // An abort means something else took over the inspection.
      if (!isAbortError(err)) {
        dispatch(changesetsInspect(null));
      }

      await toastError(err, loadChangesetsMessages, 'inspectError');
    }
  },
};
