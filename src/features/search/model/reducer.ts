import { clearMapFeatures } from '@app/store/actions.js';
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
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
  searchUnselectResult,
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
  searchSeq: number;
  /**
   * Bumped whenever `selectedResults` changes. The map layers are keyed on it:
   * react-leaflet builds its layers from the data it was first given, so a
   * result whose geometry arrives later reaches the map only through a remount.
   */
  searchResultSeq: number;
  query: string;
}

export const searchInitialState: SearchState = {
  results: [],
  selectedResults: [],
  previewId: null,
  searchSeq: 0,
  searchResultSeq: 0,
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

  state.searchResultSeq += 1;
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

      state.searchSeq = state.searchSeq + 1;
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
      state.searchResultSeq = state.searchResultSeq + 1;

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
      if (removeResult(state, action.payload)) {
        state.searchResultSeq = state.searchResultSeq + 1;
      }
    })
    .addCase(searchKeepResult, (state, { payload }) => {
      if (indexOfResult(state, payload.id) === -1) {
        return;
      }

      if (payload.keep) {
        if (state.previewId && featureIdsEqual(state.previewId, payload.id)) {
          state.previewId = null;
        }
      } else {
        takePreview(state, payload.id);
      }
    }),
);
