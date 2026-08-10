import { clearMapFeatures } from '@app/store/actions.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { affectsElevationSmoothing } from '@features/elevationChart/model/settingsReducer.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { FeatureCollection } from 'geojson';
import {
  dataViewerDelete,
  dataViewerDownloadTrack,
  dataViewerGpxLoad,
  dataViewerResolveElevationPrompt,
  dataViewerSetData,
  dataViewerSetElevation,
  dataViewerSetElevationPrompt,
  dataViewerSetGpxUrl,
  dataViewerSetRenderGeojson,
  dataViewerSetSelectedTrack,
  dataViewerSetTrackUID,
  type ElevationConsumer,
  type ElevationFillMode,
} from './actions.js';

export interface DataViewerStateBase {
  trackGeojson: FeatureCollection | null;
  // Render-only densified copy of `trackGeojson` (extra DEM-sampled points on
  // long segments). A cache: `null` means consumers read `trackGeojson`. Never
  // exported; cleared whenever `trackGeojson` changes.
  renderTrackGeojson: FeatureCollection | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface DataViewerState extends DataViewerStateBase {
  elevationPrompt: ElevationConsumer | null;
  // The user's elevation decision for the loaded track: 'undecided' until they
  // answer the prompt (so we don't ask again, and the info panel can report the
  // source), then the chosen fill mode. 'all' means every point now comes from
  // the terrain model, so another server overwrite would be pointless.
  elevationDecision: ElevationDecision;
  // Source tokens the elevation API named for the values it wrote into
  // `trackGeojson` (see `elevationSourcesFromTokens`). Kept because the write
  // happens once, at the prompt, while the chart crediting it can open much
  // later — and a dense recording densifies to nothing, so the render copy alone
  // would name no source. Tracks `elevationDecision`: emptied whenever that is.
  elevationSources: string[];
  // Which line the chart / "more info" / highlight act on, by index into
  // `trackGeojson.features`; `null` falls back to the first line. Reset on load.
  selectedTrackIndex: number | null;
}

export type ElevationDecision = 'undecided' | ElevationFillMode;

export const cleanState: DataViewerStateBase = {
  trackGeojson: null,
  renderTrackGeojson: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const dataViewerInitialState: DataViewerState = {
  elevationPrompt: null,
  elevationDecision: 'undecided',
  elevationSources: [],
  selectedTrackIndex: null,
  ...cleanState,
};

export const dataViewerReducer = createReducer(
  dataViewerInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => dataViewerInitialState)
      .addCase(dataViewerDelete, () => dataViewerInitialState)
      .addCase(dataViewerSetData, (state, action) => {
        // A new track is a fresh elevation decision.
        if (action.payload.trackGeojson) {
          state.trackGeojson = action.payload.trackGeojson;

          // Invalidate the densified render cache for the new track.
          state.renderTrackGeojson = null;

          state.elevationDecision = 'undecided';

          state.elevationSources = [];

          // The feature indices changed; fall back to the first line.
          state.selectedTrackIndex = null;
        }
      })
      .addCase(dataViewerSetElevation, (state, action) => {
        state.trackGeojson = action.payload.trackGeojson;

        state.elevationSources = action.payload.sources;

        // Re-enriched elevation invalidates the densified render cache.
        state.renderTrackGeojson = null;
      })
      .addCase(dataViewerSetRenderGeojson, (state, action) => {
        state.renderTrackGeojson = action.payload;
      })
      .addCase(elevationSetSettings, (state, { payload }) => {
        // The render copy is derived from the smoothing windows, and from
        // nothing else in the slice — the steepness window is read off the
        // drawn points, so dropping the cache for it would resample for nothing.
        if (affectsElevationSmoothing(payload)) {
          state.renderTrackGeojson = null;
        }
      })
      .addCase(dataViewerSetTrackUID, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(dataViewerDownloadTrack, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(dataViewerSetSelectedTrack, (state, action) => {
        state.selectedTrackIndex = action.payload;
      })
      .addCase(dataViewerSetElevationPrompt, (state, action) => {
        state.elevationPrompt = action.payload;
      })
      .addCase(dataViewerResolveElevationPrompt, (state, action) => {
        state.elevationPrompt = null;

        state.elevationDecision = action.payload.mode;
      })
      .addCase(dataViewerSetGpxUrl, (state, { payload }) => {
        state.gpxUrl = payload;
      })
      .addCase(dataViewerGpxLoad, (state, action) => {
        state.gpxUrl = action.payload;
      })
      .addCase(
        mapsLoaded,
        (
          _state,
          {
            payload: {
              data: { trackViewer },
            },
          },
        ) => ({ ...dataViewerInitialState, ...trackViewer }),
      ),
);
