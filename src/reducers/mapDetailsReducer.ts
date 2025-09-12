import { createReducer } from '@reduxjs/toolkit';
import {
  mapDetailsExcludeSources,
  MapDetailsSource,
} from '../actions/mapDetailsActions.js';

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
