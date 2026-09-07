import { featureIdsEqual } from '@shared/types/featureId.js';
import type { SavedSearchResult } from './actions.js';
import type { SearchState } from './reducer.js';

/**
 * The kept results to store in a map document.
 *
 * The previewed one is left out for the reason the URL leaves it out too: it
 * lasts only as long as it is being looked at, so storing it would promise
 * something the map was never asked to hold. So is a result standing in for a
 * fetch in flight, which is nothing but an id.
 */
export function savedSearchResultsFromState(
  state: SearchState,
): SavedSearchResult[] {
  return state.selectedResults
    .filter(
      (result) =>
        !result.loading &&
        !(state.previewId && featureIdsEqual(state.previewId, result.id)),
    )
    .map(({ loading: _loading, ...result }) => result);
}
