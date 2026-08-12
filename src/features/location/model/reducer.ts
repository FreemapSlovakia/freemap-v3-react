import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import {
  locateFailed,
  locationSetExternalSource,
  setLocation,
  toggleLocate,
} from './actions.js';

interface GpsLocation extends LatLon {
  accuracy: number;
  /** Course over ground in degrees clockwise from true north; `null` when unknown. */
  heading: number | null;
  /** Ground speed in m/s; `null` when unknown. */
  speed: number | null;
  /** When the fix was taken, epoch ms. */
  at: number;
}

export interface LocationState {
  location: GpsLocation | null;
  locate: boolean;
  /** Locating is on and the first fix has neither arrived nor failed yet. */
  locating: boolean;
  /** Something other than the browser is supplying the fixes; see the action. */
  externalSource: boolean;
}

export const locationInitialState: LocationState = {
  location: null,
  locate: false,
  locating: false,
  externalSource: false,
};

export const locationReducer = createReducer(locationInitialState, (builder) =>
  builder
    .addCase(setLocation, (state, action) => {
      state.location = {
        lat: action.payload.lat,
        lon: action.payload.lon,
        accuracy: action.payload.accuracy,
        heading: action.payload.heading,
        speed: action.payload.speed,
        at: action.payload.at,
      };

      state.locating = false;
    })
    .addCase(toggleLocate, (state, action) => {
      state.locate = action.payload ?? !state.locate;
      state.location = null;
      state.locating = state.locate;
    })
    .addCase(locateFailed, (state) => {
      state.locating = false;
    })
    .addCase(locationSetExternalSource, (state, action) => {
      state.externalSource = action.payload;
    }),
);
