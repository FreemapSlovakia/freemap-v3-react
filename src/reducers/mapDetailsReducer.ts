import { createReducer } from '@reduxjs/toolkit';
import { clearMapFeatures } from 'fm3/actions/mainActions';
import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';

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
