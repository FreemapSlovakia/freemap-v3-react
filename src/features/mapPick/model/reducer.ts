import { clearMapFeatures } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import { mapPickClear, mapPickSetPosition } from './actions.js';

/**
 * The pending answer of the picking modes that keep none of their own —
 * panorama, viewshed, toposcope. Cleared when its mode ends; see
 * `useClearMapPickOnLeave`.
 */
export interface MapPickState {
  position: LatLon | null;
}

const initialState: MapPickState = { position: null };

export const mapPickReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mapPickSetPosition, (state, { payload }) => {
      state.position = payload;
    })
    .addCase(mapPickClear, () => initialState)
    .addCase(clearMapFeatures, () => initialState),
);
