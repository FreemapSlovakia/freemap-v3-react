import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import {
  homeLocationSent,
  saveHomeLocation,
  setSelectingHomeLocation,
} from './actions.js';

export interface HomeLocationState {
  homeLocation: LatLon | null;
  /** Set or removed here but not yet on the account, which it then overrides. */
  unsent: boolean;
  selectingHomeLocation: LatLon | null | false;
}

export const homeLocationInitialState: HomeLocationState = {
  homeLocation: null,
  unsent: false,
  selectingHomeLocation: false,
};

export const homeLocationReducer = createReducer(
  homeLocationInitialState,
  (builder) =>
    builder
      // The account's, unless a change made here is still on its way there.
      .addCase(authSetUser, (state, action) => {
        if (action.payload && !state.unsent) {
          state.homeLocation = action.payload.coordinates;
        }
      })
      .addCase(authLogout, (state) => {
        state.homeLocation = null;

        state.unsent = false;
      })
      .addCase(setSelectingHomeLocation, (state, action) => {
        state.selectingHomeLocation =
          action.payload === true ? state.homeLocation : action.payload;
      })
      .addCase(saveHomeLocation, (state, action) => {
        state.homeLocation = action.payload;

        state.unsent = true;

        state.selectingHomeLocation = false;
      })
      .addCase(homeLocationSent, (state, action) => {
        // Unless it changed again while the request was out.
        if (
          JSON.stringify(state.homeLocation) === JSON.stringify(action.payload)
        ) {
          state.unsent = false;
        }
      }),
);
