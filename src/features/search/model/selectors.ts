import type { RootState } from '@app/store/store.js';
import { type FeatureId, featureIdsEqual } from '@shared/types/featureId.js';
import type { SearchResult } from './actions.js';

/**
 * The result the selection toolbar and the details panel are about — the last
 * one picked, of however many are shown. `null` when nothing is selected, or
 * when the selected feature isn't a search result.
 */
export function activeSearchResultSelector(
  state: RootState,
): SearchResult | null {
  const { selection } = state.main;

  return selection?.type === 'search'
    ? (state.search.selectedResults.find((result) =>
        featureIdsEqual(result.id, selection.id),
      ) ?? null)
    : null;
}

/**
 * Whether what is shown for `id` is the stand-in for a fetch in flight — an
 * entry that is nothing but the id, as opposed to a result that arrived with
 * geometry of its own and is only being upgraded.
 */
export function isResultLoadingSelector(
  state: RootState,
  id: FeatureId,
): boolean {
  return Boolean(
    state.search.selectedResults.find((result) =>
      featureIdsEqual(result.id, id),
    )?.loading,
  );
}

/**
 * Whether the result being looked at is kept rather than merely previewed — a
 * previewed one goes with its toolbar, so only a kept one needs a way to say
 * "take this off the map".
 */
export function activeSearchResultKeptSelector(state: RootState): boolean {
  const { selection } = state.main;

  const { previewId } = state.search;

  return (
    selection?.type === 'search' &&
    !(previewId && featureIdsEqual(previewId, selection.id))
  );
}
