import { clearMapFeatures, closeTool } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { mod } from '@shared/mathUtils.js';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaErrorCode } from '../api.js';
import type { PanoramaLabel } from '../labels/types.js';
import {
  type PanoramaProbe,
  panoramaCancel,
  panoramaClear,
  panoramaMoveViewpoint,
  panoramaPick,
  panoramaSetAzimuth,
  panoramaSetError,
  panoramaSetPickingViewpoint,
  panoramaSetProbe,
  panoramaSetRender,
  panoramaSetRendering,
} from './actions.js';

/**
 * Everything about a finished render but the picture itself and its distance
 * buffer, which are neither serializable nor small — those stay in
 * `renderHolder`, matched to this by `id`.
 */
export interface PanoramaRenderInfo {
  id: number;
  viewpoint: LatLon;
  /** What it is of, quality included; see `panoramaRenderKey`. */
  key: string;
  /** The fast pass, shown while the detailed one is still rendering. */
  preview: boolean;
  /** Metres above sea level, eye height included. */
  eyeElevation: number;
  width: number;
  height: number;
  /** Azimuth of the image's left edge. */
  azStart: number;
  altMin: number;
  altMax: number;
  stepDeg: number;
  labels: PanoramaLabel[];
  /** How many renders were waiting when this one was admitted. */
  queueDepth: number;
}

export interface PanoramaState {
  /** Where the marker stands; the picture may still be of somewhere else. */
  viewpoint: LatLon | null;
  rendering: boolean;
  error: PanoramaErrorCode | null;
  render: PanoramaRenderInfo | null;
  /** Bearing the middle of the viewer looks at; see `panoramaSetAzimuth`. */
  azimuth: number;
  probe: PanoramaProbe | null;
  /** The map is waiting for a click that says where to stand. */
  pickingViewpoint: boolean;
}

export const panoramaInitialState: PanoramaState = {
  viewpoint: null,
  rendering: false,
  error: null,
  render: null,
  azimuth: 0,
  probe: null,
  pickingViewpoint: false,
};

export const panoramaReducer = createReducer(panoramaInitialState, (builder) =>
  builder
    .addCase(panoramaPick, (state, { payload }) => {
      state.viewpoint = payload;

      state.error = null;

      state.probe = null;

      state.pickingViewpoint = false;
    })
    .addCase(panoramaSetPickingViewpoint, (state, { payload }) => {
      state.pickingViewpoint = payload;
    })
    .addCase(panoramaMoveViewpoint, (state, { payload }) => {
      state.viewpoint = payload;
    })
    .addCase(panoramaSetRendering, (state, { payload }) => {
      state.rendering = payload;

      if (payload) {
        state.error = null;
      }
    })
    .addCase(panoramaSetRender, (state, { payload }) => {
      state.render = payload;

      state.error = null;

      state.probe = null;
    })
    .addCase(panoramaSetError, (state, { payload }) => {
      state.error = payload;

      state.rendering = false;
    })
    .addCase(panoramaCancel, (state) => {
      state.rendering = false;
    })
    .addCase(panoramaSetAzimuth, (state, { payload }) => {
      state.azimuth = mod(payload, 360);
    })
    .addCase(panoramaSetProbe, (state, { payload }) => {
      state.probe = payload;
    })
    .addCase(panoramaClear, () => panoramaInitialState)
    // Keyed on this tool going, not on any tool closing: another opening beside
    // it says nothing about the panorama.
    // Closing keeps the picture — a render is seconds of a one-at-a-time
    // server. Two flags do go, because what would clear them cannot: the render
    // in flight is cancelled with the panel, and a map left waiting for a click
    // nobody can cancel would keep the rest of the UI hidden.
    .addCase(closeTool, (state, { payload }) => {
      if (payload === 'panorama') {
        state.rendering = false;

        state.pickingViewpoint = false;
      }
    })
    .addCase(clearMapFeatures, () => panoramaInitialState),
);
