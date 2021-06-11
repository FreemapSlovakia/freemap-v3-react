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

  // TODO these data are derived - remove
  osmNodeId: number | null;
  osmWayId: number | null;
  osmRelationId: number | null;
}

export const searchInitialState: SearchState = {
  results: [],
  searchSeq: 0,
  selectedResult: null,

  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
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
  .handleAction(osmLoadNode, (_state, action) => ({
    ...searchInitialState,
    osmNodeId: action.payload,
  }))
  .handleAction(osmLoadWay, (_state, action) => ({
    ...searchInitialState,
    osmWayId: action.payload,
  }))
  .handleAction(osmLoadRelation, (_state, action) => ({
    ...searchInitialState,
    osmRelationId: action.payload,
  }))
  .handleAction(searchSelectResult, (state, action) =>
    produce(state, (draft) => {
      draft.osmNodeId = null;
      draft.osmWayId = null;
      draft.osmRelationId = null;

      draft.selectedResult = action.payload;

      switch (action.payload?.osmType) {
        case 'node':
          draft.osmNodeId = action.payload.id;
          break;
        case 'way':
          draft.osmWayId = action.payload.id;
          break;
        case 'relation':
          draft.osmRelationId = action.payload.id;
          break;
      }
    }),
  );
