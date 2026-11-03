import type { RootState } from '@app/store/store.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { activeSearchResultSelector } from '@features/search/model/selectors.js';
import {
  featureIdsEqual,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import type { ObjectsResult } from './actions.js';
import { objectToSearchResult } from './objectToSearchResult.js';

export type DetailsTarget = {
  /**
   * Identifies the subject across re-runs. A key rather than the result's
   * identity: every pan and zoom rebuilds the objects list, and a new identity
   * would re-add the toast for an object the user is still looking at.
   */
  key: string;
  result: SearchResult;
};

type Subject =
  | { kind: 'search'; result: SearchResult }
  | { kind: 'objects'; object: ObjectsResult };

function subject(state: RootState): Subject | null {
  const { selection } = state.main;

  if (selection?.type === 'search') {
    const result = activeSearchResultSelector(state);

    // An element whose fetch is in flight has nothing to describe yet.
    return result && !result.loading ? { kind: 'search', result } : null;
  }

  if (selection?.type === 'objects') {
    const object = state.objects.objects.find((o) =>
      featureIdsEqual(o.id, selection.id),
    );

    return object ? { kind: 'objects', object } : null;
  }

  return null;
}

function keyOf(s: Subject): string {
  // The `incomplete` flag is part of a search key, so the toast follows one and
  // the same result through its upgrade to the fully loaded element.
  return s.kind === 'search'
    ? `search:${stringifyFeatureId(s.result.id)}:${s.result.incomplete ? 'incomplete' : 'complete'}`
    : `objects:${stringifyFeatureId(s.object.id)}`;
}

/** What the details toast is about, or `null` if the selection has no details. */
export function detailsTarget(state: RootState): DetailsTarget | null {
  const s = subject(state);

  return s
    ? {
        key: keyOf(s),
        result: s.kind === 'search' ? s.result : objectToSearchResult(s.object),
      }
    : null;
}

/** The subject the toast should be showing, `null` for none. */
export function wantedTarget(state: RootState): DetailsTarget | null {
  return state.main.detailsShown ? detailsTarget(state) : null;
}

/** `wantedTarget`'s key alone, cheap enough to run on every action. */
export function wantedKey(state: RootState): string | undefined {
  const s = state.main.detailsShown ? subject(state) : null;

  return s ? keyOf(s) : undefined;
}
