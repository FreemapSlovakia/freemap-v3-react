import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import {
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
  /** Something other than the browser is supplying the fixes; see the action. */
  externalSource: boolean;
}

export const locationInitialState: LocationState = {
  location: null,
  locate: false,
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
    })
    .addCase(toggleLocate, (state, action) => {
      state.locate = action.payload ?? !state.locate;
      state.location = null;
    })
    .addCase(locationSetExternalSource, (state, action) => {
      state.externalSource = action.payload;
    }),
);
