import { httpRequest } from '@app/httpRequest.js';
import {
  clearMapFeatures,
  selectFeature,
  setTool,
  setTools,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadChangesetsMessages } from '../translations/loadChangesetsMessages.js';
import {
  type Changeset,
  changesetsRefresh,
  changesetsSet,
  changesetsSetLastFetchedBBox,
  changesetsSetParams,
} from './actions.js';

export const changesetsTrackProcessor: Processor = {
  stateChangePredicate: (state) =>
    [state.changesets.days, state.changesets.authorName].join(','),
  handle: ({ getState }) => {
    const { changesets } = getState();

    const sp = new URLSearchParams();

    if (changesets.days) {
      sp.append('days', String(changesets.days));
    }

    sp.append('byAuthor', String(Boolean(changesets.authorName)));

    trackMatomo(['trackEvent', 'Changesets', 'search', sp.toString()]);
  },
};

export const changesetsProcessor: Processor = {
  id: 'changeset.detail',
  actionCreator: [changesetsSetParams, changesetsRefresh, setTool, setTools],
  handle: async ({ action, dispatch, getState, toastError }) => {
    // setTool fires for every tool; only (re)fetch when changesets is the one
    // being opened, not when some other tool opens while changesets stays up,
    // nor when changesets itself is being closed.
    if (
      setTool.match(action) &&
      (action.payload.tool !== 'changesets' || action.payload.mode === 'close')
    ) {
      return;
    }

    const state = getState();

    if (!state.main.tools.includes('changesets')) {
      return;
    }

    // Cancel the fetch/toasts whenever the changesets tool leaves the open set —
    // closing it, closing all tools, or a restore without it.
    const changesetsClosed = (s: RootState) =>
      !s.main.tools.includes('changesets');

    const { zoom } = state.map;

    const { days, authorName } = state.changesets;

    const days2 = days ?? 3;

    try {
      if (
        !authorName &&
        ((days2 > 2 && zoom < 10) ||
          (days2 > 6 && zoom < 11) ||
          (days2 > 13 && zoom < 12) ||
          (days2 > 29 && zoom < 13))
      ) {
        dispatch(changesetsSet([]));

        dispatch(
          toastsAdd({
            id: 'changeset.detail',
            messageKey: 'tooBig',
            messageLoader: loadChangesetsMessages,
            cancelType: [
              selectFeature.type,
              changesetsSetParams.type,
              clearMapFeatures.type,
            ],
            statePredicate: changesetsClosed,
            timeout: 5000,
            style: 'warning',
          }),
        );

        return;
      }

      dispatch(toastsRemove('changeset.detail'));

      const t = new Date();

      t.setDate(t.getDate() - (state.changesets.days ?? 3));

      const fromTime = `${t.getFullYear()}/${
        t.getMonth() + 1
      }/${t.getDate()}T00:00:00+00:00`;

      const bbox = (await mapPromise).getBounds().toBBoxString();

      dispatch(changesetsSetLastFetchedBBox(bbox));

      await loadChangesets(null, []);

      async function loadChangesets(
        toTime0: string | null,
        changesetsFromPreviousRequest: Changeset[],
      ): Promise<void> {
        const res = await httpRequest({
          getState,
          url:
            `${process.env['OSM_API_URL']}/api/0.6/changesets?` +
            objectToURLSearchParams({
              bbox,
              time: fromTime + (toTime0 ? `,${toTime0}` : ''),
              display_name: state.changesets.authorName ?? undefined,
            }),
          expectedStatus: [200, 404],
          cancelActions: [
            changesetsSetParams,
            changesetsRefresh,
            selectFeature,
            clearMapFeatures,
          ],
          statePredicate: changesetsClosed,
        });

        const xml = new DOMParser().parseFromString(
          await res.text(),
          'text/xml',
        );

        const rawChangesets = xml.getElementsByTagName('changeset');

        const arrayOfrawChangesets = Array.from(rawChangesets);

        const changesetsFromThisRequest = arrayOfrawChangesets
          .map((rawChangeset) => {
            const minLat = parseFloat(
              rawChangeset.getAttribute('min_lat') ?? '',
            );

            const maxLat = parseFloat(
              rawChangeset.getAttribute('max_lat') ?? '',
            );

            const minLon = parseFloat(
              rawChangeset.getAttribute('min_lon') ?? '',
            );

            const maxLon = parseFloat(
              rawChangeset.getAttribute('max_lon') ?? '',
            );

            const descriptionTag = Array.from(
              rawChangeset.getElementsByTagName('tag'),
            ).find((tag) => tag.getAttribute('k') === 'comment');

            const changeset: Changeset = {
              userName: rawChangeset.getAttribute('user') ?? '???',
              id: Number(rawChangeset.getAttribute('id') ?? '???'),
              centerLat: (minLat + maxLat) / 2.0,
              centerLon: (minLon + maxLon) / 2.0,
              closedAt: new Date(
                rawChangeset.getAttribute('closed_at') ?? '???',
              ),
              description: descriptionTag?.getAttribute('v') ?? '???',
            };

            return changeset;
          })
          .filter(
            (changeset) =>
              changeset.centerLat > 47.63617 &&
              changeset.centerLat < 49.66746 &&
              changeset.centerLon > 16.69965 &&
              changeset.centerLon < 22.67475,
          );

        const allChangesetsSoFar = [...changesetsFromPreviousRequest];

        const allChangesetSoFarIDs = allChangesetsSoFar.map((ch) => ch.id);

        for (const ch of changesetsFromThisRequest) {
          if (allChangesetSoFarIDs.indexOf(ch.id) < 0) {
            // occasionally the changeset may already be here from previous ajax request
            allChangesetsSoFar.push(ch);
          }
        }

        dispatch(changesetsSet(allChangesetsSoFar));

        if (arrayOfrawChangesets.length === 100) {
          const toTimeOfOldestChangeset = arrayOfrawChangesets
            .at(-1)!
            .getAttribute('closed_at');

          await loadChangesets(toTimeOfOldestChangeset, allChangesetsSoFar);

          return;
        }

        if (allChangesetsSoFar.length === 0) {
          dispatch(
            toastsAdd({
              id: 'changeset.detail',
              messageKey: 'notFound',
              messageLoader: loadChangesetsMessages,
              cancelType: [
                selectFeature.type,
                changesetsSetParams.type,
                clearMapFeatures.type,
                mapRefocus.type,
              ],
              statePredicate: changesetsClosed,
              timeout: 5000,
              style: 'warning',
            }),
          );
        }
      }
    } catch (err) {
      await toastError(err, loadChangesetsMessages, 'fetchError');
    }
  },
};
