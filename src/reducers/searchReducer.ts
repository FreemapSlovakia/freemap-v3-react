import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from 'fm3/actions/osmActions';
import {
  SearchResult,
  searchSelectResult,
  searchSetResults,
} from 'fm3/actions/searchActions';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';

export interface SearchState {
  results: SearchResult[];
  selectedResult: SearchResult | null;
  searchSeq: number;
  searchResultSeq: number;

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
};

export const searchReducer = createReducer<SearchState, RootAction>(
  searchInitialState,
)
  .handleAction(clearMap, () => searchInitialState)
  .handleAction(searchSetResults, (state, action) => ({
    ...state,
    results: action.payload,
    searchSeq: state.searchSeq + 1,
  }))
  .handleAction(osmLoadNode, (state, action) => ({
    ...state,
    ...searchInitialState0,
    osmNodeId: action.payload,
  }))
  .handleAction(osmLoadWay, (state, action) => ({
    ...state,
    ...searchInitialState0,
    osmWayId: action.payload,
  }))
  .handleAction(osmLoadRelation, (state, action) => ({
    ...state,
    ...searchInitialState0,
    osmRelationId: action.payload,
  }))
  .handleAction(searchSelectResult, (state, action) =>
    produce(state, (draft) => {
      draft.osmNodeId = null;
      draft.osmWayId = null;
      draft.osmRelationId = null;

      const { payload } = action;

      const result = payload?.result;

      draft.selectedResult = result ?? null;

      draft.searchResultSeq = draft.searchResultSeq + 1;

      if (result) {
        switch (result.osmType) {
          case 'node':
            draft.osmNodeId = result.id;
            break;
          case 'way':
            draft.osmWayId = result.id;
            break;
          case 'relation':
            draft.osmRelationId = result.id;
            break;
        }
      }
    }),
  );
