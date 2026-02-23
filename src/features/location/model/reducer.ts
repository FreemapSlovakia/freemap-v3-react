import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import { setLocation, toggleLocate } from './actions.js';

interface GpsLocation extends LatLon {
  accuracy: number;
}

export interface LocationState {
  location: GpsLocation | null;
  locate: boolean;
}

export const locationInitialState: LocationState = {
  location: null,
  locate: false,
};

export const locationReducer = createReducer(locationInitialState, (builder) =>
  builder
    .addCase(setLocation, (state, action) => {
      state.location = {
        lat: action.payload.lat,
        lon: action.payload.lon,
        accuracy: action.payload.accuracy,
      };
    })
    .addCase(toggleLocate, (state, action) => {
      state.locate = action.payload ?? !state.locate;
      state.location = null;
    }),
);
