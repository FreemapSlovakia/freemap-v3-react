import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { osmClear } from '@features/osm/model/osmActions.js';
import { createReducer } from '@reduxjs/toolkit';
import { FeatureCollection } from 'geojson';
import {
  type ElevationConsumer,
  type ElevationFillMode,
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerResolveElevationPrompt,
  trackViewerSetData,
  trackViewerSetElevation,
  trackViewerSetElevationPrompt,
  trackViewerSetRenderGeojson,
  trackViewerSetSelectedTrack,
  trackViewerSetTrackUID,
} from './actions.js';

export interface TrackViewerStateBase {
  trackGeojson: FeatureCollection | null;
  // Render-only densified copy of `trackGeojson` (extra DEM-sampled points on
  // long segments). A cache: `null` means consumers read `trackGeojson`. Never
  // exported; cleared whenever `trackGeojson` changes.
  renderTrackGeojson: FeatureCollection | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface TrackViewerState extends TrackViewerStateBase {
  elevationPrompt: ElevationConsumer | null;
  // The user's elevation decision for the loaded track: 'undecided' until they
  // answer the prompt (so we don't ask again, and the info panel can report the
  // source), then the chosen fill mode. 'all' means every point now comes from
  // the terrain model, so another server overwrite would be pointless.
  elevationDecision: ElevationDecision;
  // Which line the chart / "more info" / highlight act on, by index into
  // `trackGeojson.features`; `null` falls back to the first line. Reset on load.
  selectedTrackIndex: number | null;
}

export type ElevationDecision = 'undecided' | ElevationFillMode;

export const cleanState: TrackViewerStateBase = {
  trackGeojson: null,
  renderTrackGeojson: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const trackViewerInitialState: TrackViewerState = {
  elevationPrompt: null,
  elevationDecision: 'undecided',
  selectedTrackIndex: null,
  ...cleanState,
};

export const trackViewerReducer = createReducer(
  trackViewerInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => trackViewerInitialState)
      .addCase(trackViewerDelete, () => trackViewerInitialState)
      .addCase(trackViewerSetData, (state, action) => {
        // A new track is a fresh elevation decision.
        if (action.payload.trackGeojson) {
          state.trackGeojson = action.payload.trackGeojson;

          // Invalidate the densified render cache for the new track.
          state.renderTrackGeojson = null;

          state.elevationDecision = 'undecided';

          // The feature indices changed; fall back to the first line.
          state.selectedTrackIndex = null;
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
      .addCase(trackViewerSetSelectedTrack, (state, action) => {
        state.selectedTrackIndex = action.payload;
      })
      .addCase(trackViewerSetElevationPrompt, (state, action) => {
        state.elevationPrompt = action.payload;
      })
      .addCase(trackViewerResolveElevationPrompt, (state, action) => {
        state.elevationPrompt = null;

        state.elevationDecision = action.payload.mode;
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
