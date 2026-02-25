import { createReducer } from '@reduxjs/toolkit';
import { processGeoipResult } from './actions.js';

export interface GeoIpState {
  countryCode?: string;
}

export const geoIpInitialState: GeoIpState = {};

export const geoIpReducer = createReducer(geoIpInitialState, (builder) =>
  builder.addCase(processGeoipResult, (state, action) => ({
    ...state,
    countryCode: action.payload.countryCode,
  })),
);
