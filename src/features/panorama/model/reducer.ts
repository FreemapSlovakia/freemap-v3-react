import { clearMapFeatures, closeTool } from '@app/store/actions.js';
import {
  locateFailed,
  toggleLocate,
} from '@features/location/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaErrorCode } from '../api.js';
import type { PanoramaLabel } from '../labels/types.js';
import {
  type PanoramaProbe,
  panoramaCancel,
  panoramaClear,
  panoramaMoveViewpoint,
  panoramaPick,
  panoramaSetAwaitingFix,
  panoramaSetAzimuth,
  panoramaSetError,
  panoramaSetProbe,
  panoramaSetRender,
  panoramaSetRendering,
  panoramaToggleFullscreen,
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
  fullscreen: boolean;
  probe: PanoramaProbe | null;
  /** Waiting for a GPS fix to stand on; see `panoramaLocate`. */
  awaitingFix: boolean;
}

export const panoramaInitialState: PanoramaState = {
  viewpoint: null,
  rendering: false,
  error: null,
  render: null,
  azimuth: 0,
  fullscreen: false,
  probe: null,
  awaitingFix: false,
};

export const panoramaReducer = createReducer(panoramaInitialState, (builder) =>
  builder
    .addCase(panoramaPick, (state, { payload }) => {
      state.viewpoint = payload;

      state.error = null;

      state.probe = null;

      state.awaitingFix = false;
    })
    .addCase(panoramaSetAwaitingFix, (state, { payload }) => {
      state.awaitingFix = payload;
    })
    // Locating gave up on its own: it stays on, but nothing is going to arrive
    // to stand on, and a button spinning for ever says the opposite.
    .addCase(locateFailed, (state) => {
      state.awaitingFix = false;
    })
    // Locating being turned on or off at all ends the wait — a refused
    // permission turns it off without ever reporting a failure, and the map's
    // own button turning it off means the user has taken this over. The
    // processor sets the flag after its own `toggleLocate`, so this can't
    // undo the wait it is starting.
    .addCase(toggleLocate, (state) => {
      state.awaitingFix = false;
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
      state.azimuth = ((payload % 360) + 360) % 360;
    })
    .addCase(panoramaToggleFullscreen, (state, { payload }) => {
      state.fullscreen = payload ?? !state.fullscreen;
    })
    .addCase(panoramaSetProbe, (state, { payload }) => {
      state.probe = payload;
    })
    .addCase(panoramaClear, () => panoramaInitialState)
    // Keyed on this tool going, not on any tool closing: another opening beside
    // it says nothing about the panorama.
    .addCase(closeTool, (state, { payload }) =>
      payload === 'panorama' ? panoramaInitialState : state,
    )
    .addCase(clearMapFeatures, () => panoramaInitialState),
);
