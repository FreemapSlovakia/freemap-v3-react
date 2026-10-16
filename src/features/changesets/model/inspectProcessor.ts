import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { fitLoadedMap, mapToFit } from '@features/map/fitMapToBbox.js';
import { isAbortError } from '@shared/isAbortError.js';
import { latLngBounds } from 'leaflet';
import { loadChangesetsMessages } from '../translations/loadChangesetsMessages.js';
import { changesetsInspect, changesetsSetInspected } from './actions.js';
import {
  type DiffElement,
  hasAdiff,
  OSM_API,
  parseAdiff,
  parseChangeset,
} from './changesetDiff.js';
import { DiffTooBigError, fetchOsmApiDiff } from './osmApiDiff.js';
import { selectedDiffElementSelector } from './selectors.js';

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
      // Ended or replaced, by whatever means.
      statePredicate: (s: RootState) =>
        s.changesetInspector.inspected?.id !== id,
    };

    const parser = new DOMParser();

    // Selected ahead of the diff, as from a history, an element it lacks would
    // be an invisible level for Esc to clear.
    const dropUnshownElement = () => {
      const state = getState();

      if (
        state.main.selection?.type === 'changeset-element' &&
        !selectedDiffElementSelector(state)
      ) {
        dispatch(selectFeature(null));
      }
    };

    // Beside the metadata. OSMCha computes the diff some minutes after the
    // changeset closes, and misses some; the OSM API stands in for those, and
    // for OSMCha down or failing.
    const diffPromise = (async () => {
      if (hasAdiff(id)) {
        try {
          const res = await httpRequest({
            ...cancel,
            url: `https://adiffs.osmcha.org/changesets/${id}.adiff`,
            expectedStatus: [200, 404],
          });

          if (res.status === 200) {
            return {
              diff: parseAdiff(
                parser.parseFromString(await res.text(), 'text/xml'),
              ),
              source: 'osmcha' as const,
            };
          }
        } catch (err) {
          if (isAbortError(err)) {
            throw err;
          }

          console.warn(err);
        }
      }

      return {
        diff: await fetchOsmApiDiff(id, cancel),
        source: 'osmApi' as const,
      };
    })();

    // Awaited below; this only keeps it from going unhandled should the
    // metadata fail first.
    diffPromise.catch(() => undefined);

    try {
      const metaRes = await httpRequest({
        ...cancel,
        url: `${OSM_API}/changeset/${id}`,
      });

      const metaEl = parser
        .parseFromString(await metaRes.text(), 'text/xml')
        .querySelector('changeset');

      if (!metaEl) {
        throw new Error(`Changeset ${id} not found`);
      }

      const changeset = parseChangeset(metaEl);

      // The details while the diff, which may be megabytes, loads.
      dispatch(changesetsSetInspected({ changeset, diff: null, source: null }));

      let result: Awaited<typeof diffPromise>;

      try {
        result = await diffPromise;
      } catch (err) {
        if (isAbortError(err)) {
          throw err;
        }

        // Its details stand, with a word on why no changes are drawn.
        dispatch(
          changesetsSetInspected(
            err instanceof DiffTooBigError
              ? { changeset, diff: null, source: 'tooBig' }
              : {
                  changeset,
                  diff: null,
                  source: 'failed',
                  error: err instanceof Error ? err.message : String(err),
                },
          ),
        );

        dropUnshownElement();

        return;
      }

      dispatch(changesetsSetInspected({ changeset, ...result }));

      dropUnshownElement();

      const { diff } = result;

      const coordsOf = (elements: DiffElement[]) =>
        elements.flatMap((element) => [
          ...(element.old?.coords ?? []),
          ...(element.new?.coords ?? []),
        ]);

      // An element selected already, as from a history, is what is being
      // looked at; the whole changeset where it has no place of its own, as a
      // relation has none.
      const focus = selectedDiffElementSelector(getState());

      const focusCoords = focus ? coordsOf([focus]) : [];

      const bounds = latLngBounds(
        focusCoords.length ? focusCoords : coordsOf(diff),
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
        getState().changesetInspector.inspected?.id === id &&
        !map.getBounds().contains(bounds)
      ) {
        fitLoadedMap(map, dispatch, bbox, { padding: 40, maxZoom: 17 });
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
