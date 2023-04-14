import { RootAction } from 'fm3/actions';
import {
  wikiLoadPreview,
  WikiPoint,
  WikiPreview,
  wikiSetPoints,
  wikiSetPreview,
} from 'fm3/actions/wikiActions';
import { createReducer } from 'typesafe-actions';

export interface WikiState {
  points: WikiPoint[];
  preview: WikiPreview | null;
  loading: string | null;
}

const initialState: WikiState = {
  points: [],
  preview: null,
  loading: null,
};

export const wikiReducer = createReducer<WikiState, RootAction>(initialState)
  .handleAction(wikiSetPoints, (state, { payload }) => ({
    ...state,
    points: payload,
  }))
  .handleAction(wikiSetPreview, (state, { payload }) => ({
    ...state,
    loading: null,
    preview: payload,
  }))
  .handleAction(wikiLoadPreview, (state, { payload }) => ({
    ...state,
    loading: payload,
    preview: null,
  }));
