import { createReducer } from 'typesafe-actions';
import {
  WikiPoint,
  wikiSetPoints,
  wikiSetPreview,
  wikiLoadPreview,
  WikiPreview,
} from 'fm3/actions/wikiActions';
import { RootAction } from 'fm3/actions';

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
