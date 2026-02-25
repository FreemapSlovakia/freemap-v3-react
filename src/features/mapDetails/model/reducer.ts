import { createReducer } from '@reduxjs/toolkit';
import { MapDetailsSource, mapDetailsExcludeSources } from './actions.js';

export interface MapDetailsState {
  excludeSources: MapDetailsSource[];
}

export const mapDetailsInitialState: MapDetailsState = {
  excludeSources: [],
};

export const mapDetailsReducer = createReducer(
  mapDetailsInitialState,
  (builder) =>
    builder.addCase(mapDetailsExcludeSources, (state, { payload }) => {
      state.excludeSources = payload;
    }),
);
