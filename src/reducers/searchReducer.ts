import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  searchSetQuery,
  searchSetResults,
  SearchResult,
  searchHighlightResult,
  searchSelectResult,
} from 'fm3/actions/searchActions';

export interface SearchState {
  query: string | null;
  results: SearchResult[];
  highlightedResult: SearchResult | null;
  selectedResult: SearchResult | null;
  inProgress: boolean;
}

const initialState = {
  query: null,
  results: [],
  highlightedResult: null,
  selectedResult: null,
  inProgress: false,
};

export const searchReducer = createReducer<SearchState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(searchSetQuery, (state, action) => ({
    ...state,
    query: action.payload,
    inProgress: true,
  }))
  .handleAction(searchSetResults, (state, action) => ({
    ...state,
    results: action.payload,
    inProgress: false,
  }))
  .handleAction(searchHighlightResult, (state, action) => ({
    ...state,
    highlightedResult: action.payload,
  }))
  .handleAction(searchSelectResult, (state, action) => ({
    ...state,
    selectedResult: action.payload,
    highlightedResult: null,
  }));
