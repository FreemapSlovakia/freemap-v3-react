import { createReducer } from '@reduxjs/toolkit';
import {
  wikiLoadPreview,
  WikiPoint,
  WikiPreview,
  wikiSetPoints,
  wikiSetPreview,
} from '../actions/wikiActions.js';

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

export const wikiReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(wikiSetPoints, (state, { payload }) => {
      state.points = payload;
    })
    .addCase(wikiSetPreview, (state, { payload }) => {
      state.loading = null;

      state.preview = payload;
    })
    .addCase(wikiLoadPreview, (state, { payload }) => {
      state.loading = payload;

      state.preview = null;
    }),
);
