import { createReducer } from '@reduxjs/toolkit';
import { authLogout, authSetUser } from '../../auth/model/actions.js';
import type { LatLon } from '../../../types/common.js';
import { saveHomeLocation, setSelectingHomeLocation } from './actions.js';

export interface HomeLocationState {
  homeLocation: LatLon | null;
  selectingHomeLocation: LatLon | null | false;
}

export const homeLocationInitialState: HomeLocationState = {
  homeLocation: null,
  selectingHomeLocation: false,
};

export const homeLocationReducer = createReducer(
  homeLocationInitialState,
  (builder) =>
    builder
      .addCase(authSetUser, (state, action) => {
        if (action.payload?.lat != null && action.payload?.lon != null) {
          state.homeLocation = {
            lat: action.payload.lat,
            lon: action.payload.lon,
          };
        }
      })
      .addCase(authLogout, (state) => {
        state.homeLocation = null;
      })
      .addCase(setSelectingHomeLocation, (state, action) => {
        state.selectingHomeLocation =
          action.payload === true ? state.homeLocation : action.payload;
      })
      .addCase(saveHomeLocation, (state) => {
        state.selectingHomeLocation = false;

        state.homeLocation = state.selectingHomeLocation || null;
      }),
);
