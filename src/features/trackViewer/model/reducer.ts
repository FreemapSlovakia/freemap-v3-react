import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { osmClear } from '@features/osm/model/osmActions.js';
import { createReducer } from '@reduxjs/toolkit';
import { FeatureCollection } from 'geojson';
import {
  type ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerResolveElevationPrompt,
  trackViewerSetData,
  trackViewerSetElevation,
  trackViewerSetElevationPrompt,
  trackViewerSetTrackUID,
} from './actions.js';

export interface TrackViewerStateBase {
  trackGeojson: FeatureCollection | null;
  trackGpx: string | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface TrackViewerState extends TrackViewerStateBase {
  colorizeTrackBy: ColorizingMode | null;
  elevationPrompt: 'chart' | null;
  // Whether the user has answered the elevation prompt for the loaded track,
  // so we don't ask again every time the chart opens.
  elevationResolved: boolean;
}

export const cleanState: TrackViewerStateBase = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const trackViewerInitialState: TrackViewerState = {
  colorizeTrackBy: null,
  elevationPrompt: null,
  elevationResolved: false,
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

          state.elevationResolved = false;
        }
      })
      .addCase(trackViewerSetElevation, (state, action) => {
        state.trackGeojson = action.payload;
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
      .addCase(trackViewerResolveElevationPrompt, (state) => {
        state.elevationPrompt = null;

        state.elevationResolved = true;
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
