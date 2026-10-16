import { httpRequest } from '@app/httpRequest.js';
import {
  clearMapFeatures,
  openTool,
  selectFeature,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
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
import { hasBbox, OSM_API, parseChangeset } from './changesetDiff.js';
import { DEFAULT_DAYS } from './reducer.js';

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

// Its own toast id, apart from the inspector's `changeset.inspector`; this
// refetches whenever any tool opens.
export const changesetsProcessor: Processor = {
  id: 'changesets.list',
  actionCreator: [changesetsSetParams, changesetsRefresh, openTool],
  statePredicate: (state) => isToolOpen(state, 'changesets'),
  handle: async ({ dispatch, getState, toastError }) => {
    const state = getState();

    // Cancel the fetch/toasts as soon as the changesets tool is gone.
    const changesetsClosed = (s: RootState) => !isToolOpen(s, 'changesets');

    const { zoom } = state.map;

    const { days, authorName } = state.changesets;

    const days2 = days ?? DEFAULT_DAYS;

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
            id: 'changesets.list',
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

      dispatch(toastsRemove('changesets.list'));

      const t = new Date();

      t.setDate(t.getDate() - (state.changesets.days ?? DEFAULT_DAYS));

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
            `${OSM_API}/changesets?` +
            objectToURLSearchParams({
              bbox,
              time: fromTime + (toTime0 ? `,${toTime0}` : ''),
              display_name: state.changesets.authorName ?? undefined,
            }),
          expectedStatus: [200, 404],
          cancelActions: [
            changesetsSetParams,
            changesetsRefresh,
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
          .map(parseChangeset)
          // An empty changeset has no bbox to place it by.
          .filter(hasBbox);

        const allChangesetsSoFar = [...changesetsFromPreviousRequest];

        const allChangesetSoFarIDs = allChangesetsSoFar.map((ch) => ch.id);

        for (const ch of changesetsFromThisRequest) {
          if (!allChangesetSoFarIDs.includes(ch.id)) {
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
              id: 'changesets.list',
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
