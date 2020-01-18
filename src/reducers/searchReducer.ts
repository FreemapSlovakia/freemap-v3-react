import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  searchSetResults,
  SearchResult,
  searchSelectResult,
} from 'fm3/actions/searchActions';

export interface SearchState {
  results: SearchResult[];
  selectedResult: SearchResult | null;
  searchSeq: number;
}

const initialState = {
  query: null,
  results: [],
  searchSeq: 0,
  selectedResult: null,
};

export const searchReducer = createReducer<SearchState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(searchSetResults, (state, action) => ({
    ...state,
    results: action.payload,
    searchSeq: state.searchSeq + 1,
  }))
  .handleAction(searchSelectResult, (state, action) => ({
    ...state,
    selectedResult: action.payload,
  }));
