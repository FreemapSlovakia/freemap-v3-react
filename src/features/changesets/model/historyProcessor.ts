import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { osmLoad } from '@features/osm/model/osmActions.js';
import { chunks } from '@shared/chunks.js';
import { isAbortError } from '@shared/isAbortError.js';
import { createLimit } from '@shared/limit.js';
import { type FeatureId, featureIdsEqual } from '@shared/types/featureId.js';
import z from 'zod';
import {
  changesetsInspect,
  changesetsReturnToHistory,
  changesetsSetHistoryVersions,
  changesetsShowHistory,
  type HistoryVersion,
  HistoryVersionSchema,
} from './actions.js';
import { OSM_API } from './changesetDiff.js';

const HistorySchema = z.object({ elements: z.array(HistoryVersionSchema) });

const ChangesetsSchema = z.object({
  changesets: z.array(
    z.object({
      id: z.number(),
      tags: z.record(z.string(), z.string()).optional(),
    }),
  ),
});

/** The API's most changesets per query. */
const CHANGESETS_PER_QUERY = 100;

/** Comment queries in flight at once, sparing the API's rate limit. */
const PARALLEL = 4;

/** The versions of the element whose history is shown, newest first. */
export const changesetsHistoryProcessor: Processor<
  typeof changesetsShowHistory
> = {
  actionCreator: changesetsShowHistory,
  handle: async ({ action, dispatch, getState }) => {
    const { payload } = action;

    if (!payload) {
      return;
    }

    const { id } = payload;

    // Read while it is this history that is shown.
    const fetchJson = async (url: string) =>
      (
        await httpRequest({
          url,
          getState,
          cancelActions: [changesetsShowHistory, clearMapFeatures],
          stateChangePredicate: (state: RootState) =>
            state.changesetInspector.history?.id,
        })
      ).json();

    let elements: HistoryVersion[];

    try {
      ({ elements } = HistorySchema.parse(
        await fetchJson(`${OSM_API}/${id.elementType}/${id.id}/history.json`),
      ));
    } catch (err) {
      if (!isAbortError(err)) {
        dispatch(
          changesetsSetHistoryVersions({
            id,
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      }

      return;
    }

    const newestFirst = elements.toReversed();

    // Shown at once; the comments follow.
    dispatch(changesetsSetHistoryVersions({ id, versions: newestFirst }));

    let comments: Map<number, string>;

    const limit = createLimit(PARALLEL);

    // One failed, the history goes without any, so the queued ones aren't sent.
    let failed = false;

    try {
      const responses = await Promise.all(
        chunks(
          [...new Set(elements.map((version) => version.changeset))],
          CHANGESETS_PER_QUERY,
        ).map((chunk) =>
          limit(
            async () => {
              try {
                return ChangesetsSchema.parse(
                  await fetchJson(
                    `${OSM_API}/changesets.json?changesets=${chunk.join(',')}&limit=${CHANGESETS_PER_QUERY}`,
                  ),
                );
              } catch (err) {
                failed = true;

                throw err;
              }
            },
            () => failed || getState().changesetInspector.history?.id !== id,
          ),
        ),
      );

      comments = new Map(
        responses.flatMap(({ changesets }) =>
          changesets.flatMap(({ id: changesetId, tags }) =>
            tags?.['comment'] ? [[changesetId, tags['comment']] as const] : [],
          ),
        ),
      );
    } catch (err) {
      // The history stands without them.
      if (!isAbortError(err)) {
        console.error(err);
      }

      return;
    }

    dispatch(
      changesetsSetHistoryVersions({
        id,
        versions: newestFirst.map((version) => ({
          ...version,
          comment: comments.get(version.changeset),
        })),
      }),
    );
  },
};

/**
 * A history stays while its element is selected, or one of its changesets is
 * inspected with a changed element or nothing selected: anything else
 * selected, by whatever means, drops it, leaving an inspection on its own.
 */
export const changesetsHistorySelectionProcessor: Processor = {
  // A string: a fresh array would differ on every action.
  stateChangePredicate: (state) =>
    JSON.stringify([state.main.selection, state.objects.awaitedSelection]),
  handle: ({ dispatch, getState }) => {
    const state = getState();

    const { history, inspected } = state.changesetInspector;

    const { selection } = state.main;

    const { awaitedSelection } = state.objects;

    if (
      history &&
      !(inspected
        ? !selection || selection.type === 'changeset-element'
        : ((selection?.type === 'objects' || selection?.type === 'search') &&
            featureIdsEqual(selection.id, history.id)) ||
          // A link's POI, its details still to come.
          (awaitedSelection !== null &&
            featureIdsEqual(awaitedSelection, history.id)))
    ) {
      dispatch(changesetsShowHistory(null));
    }
  },
};

/**
 * An inspection drilled into from a history ends back at it, however it is
 * ended: Back, Esc, the browser's Back, a failed fetch.
 */
export const changesetsReturnToHistoryProcessor: Processor<
  typeof changesetsInspect
> = {
  actionCreator: changesetsInspect,
  actionPredicate: (action) => action.payload === null,
  statePredicate: (state) =>
    state.changesetInspector.history !== null &&
    state.changesetInspector.inspected !== null,
  transform: ({ getState }) => {
    const state = getState();

    const history = state.changesetInspector.history!;

    // Gone from the objects layer or the search results meanwhile, the element
    // is loaded on its own.
    const isThere = (o: { id: FeatureId }) => featureIdsEqual(o.id, history.id);

    const { selection } = history;

    const present =
      selection.type === 'objects'
        ? state.objects.objects.some(isThere)
        : state.search.selectedResults.some(isThere);

    return present
      ? changesetsReturnToHistory({ selection })
      : // Unpinned: a kept one would still be there, so it was only looked at.
        changesetsReturnToHistory({
          selection: { type: 'search', id: history.id },
          reload: history.id,
        });
  },
};

/**
 * Not from the transform above: a load it started would be cancelled by the
 * action it returns, whose processors compare against the state before both.
 */
export const changesetsReloadHistoryElementProcessor: Processor<
  typeof changesetsReturnToHistory
> = {
  actionCreator: changesetsReturnToHistory,
  handle: ({ action, dispatch }) => {
    if (action.payload.reload) {
      dispatch(osmLoad({ ids: [action.payload.reload], focus: false }));
    }
  },
};
