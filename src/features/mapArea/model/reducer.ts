import { createReducer } from '@reduxjs/toolkit';
import {
  type Bbox,
  mapAreaClear,
  mapAreaSelectCancel,
  mapAreaSelectConfirm,
  mapAreaSelectStart,
  mapAreaSetSelecting,
} from './actions.js';

export interface MapAreaState {
  // the rectangle currently being drawn; non-null means drawing mode is active
  selecting: Bbox | null;
  // the last confirmed rectangle, consumed as the export/cache area
  bbox: Bbox | null;
}

export const mapAreaInitialState: MapAreaState = {
  selecting: null,
  bbox: null,
};

export const mapAreaReducer = createReducer(mapAreaInitialState, (builder) =>
  builder
    .addCase(mapAreaSelectStart, (state, action) => {
      state.selecting = action.payload;
    })
    .addCase(mapAreaSetSelecting, (state, action) => {
      state.selecting = action.payload;
    })
    .addCase(mapAreaSelectConfirm, (state) => {
      if (state.selecting) {
        const [a, b, c, d] = state.selecting;

        // normalize to [west, south, east, north] in case the rectangle was
        // dragged inside-out
        state.bbox = [
          Math.min(a, c),
          Math.min(b, d),
          Math.max(a, c),
          Math.max(b, d),
        ];
      }

      state.selecting = null;
    })
    .addCase(mapAreaSelectCancel, (state) => {
      state.selecting = null;
    })
    .addCase(mapAreaClear, (state) => {
      state.bbox = null;
      state.selecting = null;
    }),
);
