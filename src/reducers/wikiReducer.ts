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
}

const initialState: WikiState = {
  points: [],
  preview: null,
};

export const wikiReducer = createReducer<WikiState, RootAction>(initialState)
  .handleAction(wikiSetPoints, (state, { payload }) => ({
    ...state,
    points: payload,
  }))
  .handleAction(wikiSetPreview, (state, { payload }) => ({
    ...state,
    preview: payload,
  }))
  .handleAction(wikiLoadPreview, (state) => ({
    ...state,
    preview: null,
  }));
