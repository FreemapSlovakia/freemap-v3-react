import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { osmLoad } from '@features/osm/model/osmActions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type FeatureId,
  featureIdsEqual,
  type OsmFeatureId,
} from '@shared/types/featureId.js';
import {
  type SearchResult,
  searchClear,
  searchKeepResult,
  searchKeepResults,
  searchSelectResult,
  searchSetHover,
  searchSetQuery,
  searchSetResults,
  searchUnselectResult,
  searchUnsetHover,
} from './actions.js';
import { loadingResult } from './resultUtils.js';

export interface SearchState {
  results: SearchResult[];
  /**
   * The results shown on the map, in the order they were added. Which one of
   * them is the active one — the subject of the selection toolbar and of the
   * details panel — is `main.selection`, so a result can be shown without being
   * the one acted upon.
   */
  selectedResults: SearchResult[];
  /**
   * Which of the shown results is only being looked at, if any — at most one,
   * and gone as soon as it stops being the selected feature. The rest were
   * kept deliberately and stay until taken off.
   */
  previewId: FeatureId | null;
  /**
   * The result the pointer rests on in the list, if any. Drawn beside the shown
   * ones and part of nothing else — it is not selected, not exported, and not
   * in the URL.
   */
  hoverResult: SearchResult | null;
  query: string;
  /** The geocoder filled the page it was given, so a longer one may hold more. */
  more: boolean;
}

export const searchInitialState: SearchState = {
  results: [],
  selectedResults: [],
  previewId: null,
  hoverResult: null,
  query: '',
  more: false,
};

function indexOfResult(state: SearchState, id: FeatureId): number {
  return state.selectedResults.findIndex((result) =>
    featureIdsEqual(result.id, id),
  );
}

function removeResult(state: SearchState, id: FeatureId): boolean {
  const index = indexOfResult(state, id);

  if (index === -1) {
    return false;
  }

  state.selectedResults.splice(index, 1);

  if (state.previewId && featureIdsEqual(state.previewId, id)) {
    state.previewId = null;
  }

  return true;
}

/** Hands the preview place to `id`, taking off whatever held it. */
function takePreview(state: SearchState, id: FeatureId): void {
  if (state.previewId && !featureIdsEqual(state.previewId, id)) {
    removeResult(state, state.previewId);
  }

  state.previewId = id;
}

/**
 * Adds the placeholder for an element being loaded, unless the element is
 * already shown — a load started for a result that is on the map (an incomplete
 * one being upgraded) must not throw away the geometry it already has, nor the
 * tier it is held at.
 */
function addLoading(
  state: SearchState,
  id: OsmFeatureId,
  pin: boolean | undefined,
): void {
  if (indexOfResult(state, id) !== -1) {
    return;
  }

  state.selectedResults.push(loadingResult(id));

  if (!pin) {
    takePreview(state, id);
  }
}

export const searchReducer = createReducer(searchInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => searchInitialState)
    .addCase(searchSetQuery, (state, { payload }) => {
      // A different question leaves the old answer's `more` describing results
      // that are about to be replaced — and not every query reaches the
      // geocoder to replace them: `@lat,lon` is a map-details lookup, and a
      // suggestion that failed says nothing at all. Either way the offer to
      // fetch a longer page of the *previous* query would still stand.
      if (payload.query !== state.query) {
        state.more = false;
      }

      state.query = payload.query;
    })
    .addCase(searchClear, () => searchInitialState)
    .addCase(searchSetResults, (state, action) => {
      state.results = action.payload.results;

      state.more = action.payload.more;

      // The pointer rests on a row of the list that is being replaced.
      state.hoverResult = null;
    })
    .addCase(searchSetHover, (state, action) => {
      state.hoverResult = action.payload;
    })
    .addCase(searchUnsetHover, (state, action) => {
      if (
        state.hoverResult &&
        featureIdsEqual(state.hoverResult.id, action.payload)
      ) {
        state.hoverResult = null;
      }
    })
    .addCase(osmLoad, (state, action) => {
      for (const id of action.payload.ids) {
        addLoading(state, id, action.payload.pin);
      }
    })
    .addCase(searchSelectResult, (state, action) => {
      // Picking is done with the pointer on the row, and closes the list under
      // it — no leave event follows.
      state.hoverResult = null;

      const { payload } = action;

      if (!payload) {
        state.selectedResults = [];

        state.previewId = null;

        return;
      }

      const { result, tier = 'preview' } = payload;

      // A result already shown stays where it is — picking it again says which
      // result is being looked at, not that a kept one should stop being kept.
      if (
        indexOfResult(state, result.id) === -1 ||
        (tier === 'preview' &&
          state.previewId &&
          featureIdsEqual(state.previewId, result.id))
      ) {
        takePreview(state, result.id);
      }

      const at = indexOfResult(state, result.id);

      if (at === -1) {
        state.selectedResults.push(result);
      } else {
        state.selectedResults[at] = result;
      }
    })
    .addCase(searchUnselectResult, (state, action) => {
      removeResult(state, action.payload);
    })
    .addCase(searchKeepResults, (state, { payload }) => {
      for (const result of payload) {
        if (indexOfResult(state, result.id) === -1) {
          state.selectedResults.push(result);
        } else if (
          state.previewId &&
          featureIdsEqual(state.previewId, result.id)
        ) {
          // Already on the map, and it keeps whatever it holds — its geometry
          // may have been loaded since, and the batch carries points. Only its
          // being transient goes.
          state.previewId = null;
        }
      }
    })
    .addCase(mapsLoaded, (state, { payload: { merge, data } }) => {
      const results = data.search?.results;

      // A document written before pins were stored says nothing about them, so
      // it takes none off: what the URL named and the loads it started are all
      // such a map has.
      if (!results) {
        return;
      }

      if (!merge) {
        state.selectedResults = results;

        // A map's results are all kept, so nothing is left being looked at —
        // including anything the map before it was showing.
        state.previewId = null;

        return;
      }

      for (const result of results) {
        const at = indexOfResult(state, result.id);

        if (at === -1) {
          state.selectedResults.push(result);

          continue;
        }

        // Already on the map, and it keeps what it holds — unless that is a
        // stand-in for a fetch, which is nothing but an id where the map
        // carries the element itself.
        if (state.selectedResults[at].loading) {
          state.selectedResults[at] = result;
        }

        // Its being transient goes either way: a map carries no previewed
        // result, so one it names is kept rather than dropped by the next thing
        // looked at.
        if (state.previewId && featureIdsEqual(state.previewId, result.id)) {
          state.previewId = null;
        }
      }
    })
    .addCase(searchKeepResult, (state, { payload }) => {
      if (
        state.previewId &&
        featureIdsEqual(state.previewId, payload) &&
        indexOfResult(state, payload) !== -1
      ) {
        state.previewId = null;
      }
    }),
);
