import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import {
  type FixConsumer,
  fixReady,
  locateFailed,
  locationSetExternalSource,
  setFixRequest,
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
  /** Who is waiting for one fix to place something by; see `requestFix`. */
  fixRequest: FixConsumer | null;
}

export const locationInitialState: LocationState = {
  location: null,
  locate: false,
  locating: false,
  externalSource: false,
  fixRequest: null,
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
    // Any toggle ends a wait — a refused permission turns locating off without
    // ever reporting a failure. `locateOnceProcessor` declares the wait after
    // its own `toggleLocate`, so this can't undo the one it is starting.
    .addCase(toggleLocate, (state, action) => {
      state.locate = action.payload ?? !state.locate;
      state.location = null;
      state.locating = state.locate;
      state.fixRequest = null;
    })
    // Locating stays on, but nothing is going to arrive to wait for.
    .addCase(locateFailed, (state) => {
      state.locating = false;
      state.fixRequest = null;
    })
    .addCase(setFixRequest, (state, action) => {
      state.fixRequest = action.payload;
    })
    .addCase(fixReady, (state) => {
      state.fixRequest = null;
    })
    .addCase(locationSetExternalSource, (state, action) => {
      state.externalSource = action.payload;
    }),
);
