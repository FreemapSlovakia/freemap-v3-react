import { createReducer } from '@reduxjs/toolkit';
import { clearMapFeatures } from '../actions/mainActions.js';
import {
  mapDetailsSetSources,
  mapDetailsSetUserSelectedPosition,
  MapDetailsSource,
} from '../actions/mapDetailsActions.js';

export interface MapDetailsState {
  coords: {
    lat: number;
    lon: number;
  } | null;
  sources: MapDetailsSource[];
}

export const mapDetailsInitialState: MapDetailsState = {
  coords: null,
  sources: ['reverse', 'nearby', 'surrounding'],
};

export const mapDetailsReducer = createReducer(
  mapDetailsInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, (state) => {
        state.coords = null;
      })
      .addCase(mapDetailsSetSources, (state, { payload }) => {
        state.sources = payload;
      })
      .addCase(mapDetailsSetUserSelectedPosition, (state, { payload }) => {
        state.coords = payload;
      }),
);
