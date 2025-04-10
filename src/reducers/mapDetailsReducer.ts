import { createReducer } from '@reduxjs/toolkit';
import { clearMapFeatures } from '../actions/mainActions.js';
import { mapDetailsSetUserSelectedPosition } from '../actions/mapDetailsActions.js';

export interface MapDetailsState {
  userSelectedLat: number | null;
  userSelectedLon: number | null;
}

const initialState: MapDetailsState = {
  userSelectedLat: null,
  userSelectedLon: null,
};

export const mapDetailsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    .addCase(mapDetailsSetUserSelectedPosition, (state, action) => ({
      ...state,
      userSelectedLat: action.payload.lat,
      userSelectedLon: action.payload.lon,
    })),
);
