import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { osmClear } from '@features/osm/model/osmActions.js';
import { createReducer } from '@reduxjs/toolkit';
import { colorizerNeedsElevation } from '@shared/colorizers/index.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { Feature, FeatureCollection, LineString } from 'geojson';
import {
  type ColorizingMode,
  type ElevationConsumer,
  trackViewerColorizeTrackBy,
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerResolveElevationPrompt,
  trackViewerSetData,
  trackViewerSetElevation,
  trackViewerSetElevationPrompt,
  trackViewerSetRenderGeojson,
  trackViewerSetTrackUID,
} from './actions.js';

export interface TrackViewerStateBase {
  trackGeojson: FeatureCollection | null;
  // Render-only densified copy of `trackGeojson` (extra DEM-sampled points on
  // long segments). A cache: `null` means consumers read `trackGeojson`. Never
  // exported; cleared whenever `trackGeojson` changes.
  renderTrackGeojson: FeatureCollection | null;
  trackGpx: string | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface TrackViewerState extends TrackViewerStateBase {
  colorizeTrackBy: ColorizingMode | null;
  elevationPrompt: ElevationConsumer | null;
  // Whether the user has answered the elevation prompt for the loaded track,
  // so we don't ask again every time the chart opens.
  elevationResolved: boolean;
  // Whether every point's elevation now comes from the terrain model, so
  // offering another server overwrite would be pointless.
  elevationOverridden: boolean;
}

export const cleanState: TrackViewerStateBase = {
  trackGeojson: null,
  renderTrackGeojson: null,
  trackGpx: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const trackViewerInitialState: TrackViewerState = {
  colorizeTrackBy: null,
  elevationPrompt: null,
  elevationResolved: false,
  elevationOverridden: false,
  ...cleanState,
};

export const trackViewerReducer = createReducer(
  trackViewerInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => trackViewerInitialState)
      .addCase(trackViewerDelete, (state) => ({
        ...trackViewerInitialState,
        colorizeTrackBy: state.colorizeTrackBy,
      }))
      .addCase(trackViewerSetData, (state, action) => {
        state.trackGpx = action.payload.trackGpx ?? state.trackGpx;

        // A new track is a fresh elevation decision.
        if (action.payload.trackGeojson) {
          state.trackGeojson = action.payload.trackGeojson;

          // Invalidate the densified render cache for the new track.
          state.renderTrackGeojson = null;

          state.elevationResolved = false;

          state.elevationOverridden = false;

          // A persisted elevation-derived colorize mode would render as a flat
          // mid-palette on a track that lacks full elevation; drop it so the
          // new track starts uncolorized rather than in a misleading state.
          if (
            state.colorizeTrackBy &&
            colorizerNeedsElevation(state.colorizeTrackBy) &&
            elevationCoverage(
              action.payload.trackGeojson.features.filter(
                (f): f is Feature<LineString> =>
                  f.geometry.type === 'LineString',
              ),
            ) !== 'full'
          ) {
            state.colorizeTrackBy = null;
          }
        }
      })
      .addCase(trackViewerSetElevation, (state, action) => {
        state.trackGeojson = action.payload;

        // Re-enriched elevation invalidates the densified render cache.
        state.renderTrackGeojson = null;
      })
      .addCase(trackViewerSetRenderGeojson, (state, action) => {
        state.renderTrackGeojson = action.payload;
      })
      .addCase(trackViewerSetTrackUID, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(trackViewerDownloadTrack, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(trackViewerColorizeTrackBy, (state, action) => {
        state.colorizeTrackBy = action.payload;
      })
      .addCase(trackViewerSetElevationPrompt, (state, action) => {
        state.elevationPrompt = action.payload;
      })
      .addCase(trackViewerResolveElevationPrompt, (state, action) => {
        state.elevationPrompt = null;

        state.elevationResolved = true;

        if (action.payload.mode === 'all') {
          state.elevationOverridden = true;
        }
      })
      .addCase(trackViewerGpxLoad, (state, action) => {
        state.gpxUrl = action.payload;
      })
      .addCase(osmClear, () => trackViewerInitialState)
      .addCase(
        mapsLoaded,
        (
          _state,
          {
            payload: {
              data: { trackViewer },
            },
          },
        ) => ({ ...trackViewerInitialState, ...trackViewer }),
      ),
);
