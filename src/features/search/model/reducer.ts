import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '@features/osm/model/osmActions.js';
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
}

export const searchInitialState: SearchState = {
  results: [],
  selectedResults: [],
  previewId: null,
  hoverResult: null,
  query: '',
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
      state.query = payload.query;
    })
    .addCase(searchClear, () => searchInitialState)
    .addCase(searchSetResults, (state, action) => {
      state.results = action.payload;

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
    .addCase(osmLoadNode, (state, action) => {
      addLoading(
        state,
        { type: 'osm', elementType: 'node', id: action.payload.id },
        action.payload.pin,
      );
    })
    .addCase(osmLoadWay, (state, action) => {
      addLoading(
        state,
        { type: 'osm', elementType: 'way', id: action.payload.id },
        action.payload.pin,
      );
    })
    .addCase(osmLoadRelation, (state, action) => {
      addLoading(
        state,
        { type: 'osm', elementType: 'relation', id: action.payload.id },
        action.payload.pin,
      );
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
        if (indexOfResult(state, result.id) === -1) {
          state.selectedResults.push(result);
        } else if (
          state.previewId &&
          featureIdsEqual(state.previewId, result.id)
        ) {
          // Already on the map, and it keeps what it holds. Only its being
          // transient goes: a map carries no previewed result, so one it names
          // is kept rather than dropped by the next thing looked at.
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
