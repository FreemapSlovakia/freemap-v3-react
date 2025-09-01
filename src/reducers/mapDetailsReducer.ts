import { createReducer } from '@reduxjs/toolkit';
import {
  mapDetailsSetSources,
  MapDetailsSource,
} from '../actions/mapDetailsActions.js';

export interface MapDetailsState {
  sources: MapDetailsSource[];
}

export const mapDetailsInitialState: MapDetailsState = {
  sources: ['reverse', 'nearby', 'surrounding'],
};

export const mapDetailsReducer = createReducer(
  mapDetailsInitialState,
  (builder) =>
    builder.addCase(mapDetailsSetSources, (state, { payload }) => {
      state.sources = payload;
    }),
);
