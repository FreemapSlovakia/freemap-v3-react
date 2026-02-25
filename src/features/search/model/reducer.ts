import { clearMapFeatures } from '@app/store/actions.js';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '@features/osm/model/osmActions.js';
import { createReducer } from '@reduxjs/toolkit';
import { OsmFeatureId } from '@shared/types/featureId.js';
import { is } from 'typia';
import {
  searchClear,
  SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from './actions.js';

export interface SearchState {
  results: SearchResult[];
  selectedResult: SearchResult | null;
  searchSeq: number;
  searchResultSeq: number;
  query: string;

  // TODO these data are derived - remove
  osmNodeId: number | null;
  osmWayId: number | null;
  osmRelationId: number | null;
}

export const searchInitialState0 = {
  searchSeq: 0,
  searchResultSeq: 0,

  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
};

export const searchInitialState: SearchState = {
  ...searchInitialState0,
  results: [],
  selectedResult: null,
  query: '',
};

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
    .addCase(osmLoadNode, (state, action) => ({
      ...state,
      ...searchInitialState0,
      osmNodeId: action.payload.id,
    }))
    .addCase(osmLoadWay, (state, action) => ({
      ...state,
      ...searchInitialState0,
      osmWayId: action.payload.id,
    }))
    .addCase(osmLoadRelation, (state, action) => ({
      ...state,
      ...searchInitialState0,
      osmRelationId: action.payload.id,
    }))
    .addCase(searchSelectResult, (state, action) => {
      if (action.payload?.storeResult === false) {
        return;
      }

      state.osmNodeId = null;

      state.osmWayId = null;

      state.osmRelationId = null;

      const { payload } = action;

      const result = payload?.result;

      state.selectedResult = result ?? null;

      state.searchResultSeq = state.searchResultSeq + 1;

      if (is<OsmFeatureId>(result?.id)) {
        switch (result.id.elementType) {
          case 'node':
            state.osmNodeId = result.id.id;

            break;

          case 'way':
            state.osmWayId = result.id.id;

            break;

          case 'relation':
            state.osmRelationId = result.id.id;

            break;
        }
      }
    }),
);
