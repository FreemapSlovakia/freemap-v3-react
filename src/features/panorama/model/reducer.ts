import { clearMapFeatures, closeTool } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { sameLatLon } from '@shared/geoutils.js';
import { angleDiff, mod } from '@shared/mathUtils.js';
import type {
  TerrainErrorCode,
  TerrainProgress,
} from '@shared/terrainService.js';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaLabel } from '../labels/types.js';
import {
  type PanoramaPicking,
  type PanoramaProbe,
  panoramaCancel,
  panoramaClear,
  panoramaLookAt,
  panoramaMoveViewpoint,
  panoramaPick,
  panoramaSetAzimuth,
  panoramaSetError,
  panoramaSetPicking,
  panoramaSetProbe,
  panoramaSetProgress,
  panoramaSetRender,
  panoramaSetRenderAz,
  panoramaSetRendering,
  panoramaSetSettings,
} from './actions.js';
import { isFullTurn } from './settingsReducer.js';

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
  /**
   * Degrees of horizon it holds. Short of a full turn the picture has ends: it
   * does not wrap, so panning stops at them and a bearing outside it reads at
   * no column at all.
   */
  fov: number;
  altMin: number;
  altMax: number;
  stepDeg: number;
  /**
   * Degrees of unfolding this picture was drawn with. What the setting says is
   * what the *next* render will do, so anything speaking about the picture in
   * hand — the revealed-names cut, the drawing-not-photograph caveat — has to
   * ask this instead.
   */
  depthLift: number;
  /** Farthest terrain it considered, metres — where the lift reaches its full. */
  rangeM: number;
  labels: PanoramaLabel[];
}

export interface PanoramaState {
  /** Where the marker stands; the picture may still be of somewhere else. */
  viewpoint: LatLon | null;
  rendering: boolean;
  /** How far the pass in flight has got; `null` while nothing is known. */
  progress: TerrainProgress | null;
  error: TerrainErrorCode | null;
  render: PanoramaRenderInfo | null;
  /** Bearing the middle of the viewer looks at; see `panoramaSetAzimuth`. */
  azimuth: number;
  /**
   * Bearing the middle of the next render faces, whole degrees. Only a fov
   * short of a full turn has one; a full turn holds every bearing already.
   */
  renderAz: number;
  probe: PanoramaProbe | null;
  /** What the map is waiting for a click to say, or `null` for nothing. */
  picking: PanoramaPicking | null;
}

export const panoramaInitialState: PanoramaState = {
  viewpoint: null,
  rendering: false,
  progress: null,
  error: null,
  render: null,
  azimuth: 0,
  renderAz: 0,
  probe: null,
  picking: null,
};

export const panoramaReducer = createReducer(panoramaInitialState, (builder) =>
  builder
    .addCase(panoramaPick, (state, { payload }) => {
      state.viewpoint = payload;

      state.error = null;

      state.probe = null;

      state.picking = null;
    })
    .addCase(panoramaSetPicking, (state, { payload }) => {
      state.picking = payload;
    })
    // The turning and the mark are both `panoramaLookAtProcessor`'s: the
    // bearing is one reading with where the place shows up in the picture —
    // or whether it shows up at all — and that is the distance buffer's
    // answer, which lives outside the store. All this has to do is give the
    // map back.
    .addCase(panoramaLookAt, (state) => {
      state.picking = null;
    })
    .addCase(panoramaMoveViewpoint, (state, { payload }) => {
      state.viewpoint = payload;
    })
    .addCase(panoramaSetRendering, (state, { payload }) => {
      state.rendering = payload;

      state.progress = null;

      if (payload) {
        state.error = null;
      }
    })
    .addCase(panoramaSetProgress, (state, { payload }) => {
      state.progress = payload;
    })
    .addCase(panoramaSetRender, (state, { payload }) => {
      // Read before the render is replaced: whether the mark below survives is
      // a question about the eye moving between the two.
      const movedEye =
        !state.render || !sameLatLon(state.render.viewpoint, payload.viewpoint);

      state.render = payload;

      state.error = null;

      // A reading belongs to the picture it came from: `iy` is an image row and
      // no two passes are the same height, and a named summit answers for the
      // set of labels this picture came with. A bare place on the map is
      // neither, and survives — that is what carries a mark across the render
      // an out-of-strip "look at" has to pay for.
      //
      // But only from the same spot: its bearing and distance were measured
      // from the eye, and `panoramaMoveViewpoint` drags that eye without
      // clearing anything, so a render of somewhere else leaves them of nowhere.
      if (state.probe?.iy !== undefined || state.probe?.peak || movedEye) {
        state.probe = null;
      }

      // A pass has ended; whatever the next one reports starts from nothing.
      state.progress = null;

      // A strip has ends, so the bearing being looked at may be outside the one
      // just rendered — a re-aimed render, or a fov narrowed round something
      // else. A bearing this picture never held says nothing about where in it
      // to look, so it goes to the middle, which is what the render was aimed
      // at; one it does hold is left alone, so an Update keeps the view.
      const middle = payload.azStart + payload.fov / 2;

      if (Math.abs(angleDiff(state.azimuth, middle)) > payload.fov / 2) {
        state.azimuth = mod(middle, 360);
      }
    })
    .addCase(panoramaSetError, (state, { payload }) => {
      state.error = payload;

      state.rendering = false;

      state.progress = null;
    })
    .addCase(panoramaCancel, (state) => {
      state.rendering = false;

      state.progress = null;
    })
    .addCase(panoramaSetAzimuth, (state, { payload }) => {
      state.azimuth = mod(payload, 360);
    })
    // Whole degrees, so a swing of the wedge and the bearing a link carries
    // back land on the same value — the render key is compared on it, and a
    // fraction of a degree apart would light Update on a URL round trip.
    .addCase(panoramaSetRenderAz, (state, { payload }) => {
      state.renderAz = mod(Math.round(payload), 360);
    })
    // Narrowing the fov frames what is already being looked at rather than
    // swinging off to whatever was aimed at last.
    .addCase(panoramaSetSettings, (state, { payload }) => {
      if (payload.fovDeg !== undefined && !isFullTurn(payload.fovDeg)) {
        // Folded like the action above: a view at 359.7° rounds to 360, and the
        // render key would then read a different direction from the 0° a swing
        // or a link lands on.
        state.renderAz = mod(Math.round(state.azimuth), 360);
      }
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

        state.progress = null;

        state.picking = null;
      }
    })
    .addCase(clearMapFeatures, () => panoramaInitialState),
);
