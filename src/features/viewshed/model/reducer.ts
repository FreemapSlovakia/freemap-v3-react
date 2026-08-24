import { clearMapFeatures } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type {
  TerrainErrorCode,
  TerrainProgress,
} from '@shared/terrainService.js';
import type { LatLon } from '@shared/types/common.js';
import {
  viewshedCancel,
  viewshedClear,
  viewshedMoveViewpoint,
  viewshedPick,
  viewshedSetError,
  viewshedSetPickingViewpoint,
  viewshedSetProgress,
  viewshedSetRender,
  viewshedSetRendering,
} from './actions.js';

/**
 * Everything about a finished render but the image itself, which is an object
 * URL and so lives in `renderHolder`.
 */
export interface ViewshedRenderInfo {
  viewpoint: LatLon;
  /** What it is of, settings included; see `viewshedRenderKey`. */
  key: string;
  /** `[west, south, east, north]` in degrees, as the overlay is drawn at. */
  bounds: [number, number, number, number];
  /** Metres above sea level, eye height included. */
  eyeElevation: number;
}

export interface ViewshedState {
  /** Where the marker stands; the overlay may still be of somewhere else. */
  viewpoint: LatLon | null;
  rendering: boolean;
  /** How far the render in flight has got; `null` while nothing is known. */
  progress: TerrainProgress | null;
  error: TerrainErrorCode | null;
  render: ViewshedRenderInfo | null;
  /** The map is waiting for a click that says where to stand. */
  pickingViewpoint: boolean;
}

export const viewshedInitialState: ViewshedState = {
  viewpoint: null,
  rendering: false,
  progress: null,
  error: null,
  render: null,
  pickingViewpoint: false,
};

export const viewshedReducer = createReducer(viewshedInitialState, (builder) =>
  builder
    .addCase(viewshedPick, (state, { payload }) => {
      state.viewpoint = payload;

      state.error = null;

      state.pickingViewpoint = false;
    })
    .addCase(viewshedSetPickingViewpoint, (state, { payload }) => {
      state.pickingViewpoint = payload;
    })
    .addCase(viewshedMoveViewpoint, (state, { payload }) => {
      state.viewpoint = payload;
    })
    .addCase(viewshedSetRendering, (state, { payload }) => {
      state.rendering = payload;

      state.progress = null;

      if (payload) {
        state.error = null;
      }
    })
    .addCase(viewshedSetProgress, (state, { payload }) => {
      state.progress = payload;
    })
    .addCase(viewshedSetRender, (state, { payload }) => {
      state.render = payload;

      state.error = null;

      state.rendering = false;

      state.progress = null;
    })
    .addCase(viewshedSetError, (state, { payload }) => {
      state.error = payload;

      state.rendering = false;

      state.progress = null;
    })
    .addCase(viewshedCancel, (state) => {
      state.rendering = false;

      state.progress = null;
    })
    .addCase(viewshedClear, () => viewshedInitialState)
    .addCase(clearMapFeatures, () => viewshedInitialState),
);
