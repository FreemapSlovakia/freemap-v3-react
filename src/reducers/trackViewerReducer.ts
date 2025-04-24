import { createReducer } from '@reduxjs/toolkit';
import { FeatureCollection } from 'geojson';
import { clearMapFeatures } from '../actions/mainActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';
import { osmClear } from '../actions/osmActions.js';
import {
  trackViewerColorizeTrackBy,
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '../actions/trackViewerActions.js';

export interface TrackViewerStateBase {
  trackGeojson: FeatureCollection | null;
  trackGpx: string | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface TrackViewerState extends TrackViewerStateBase {
  colorizeTrackBy: null | 'elevation' | 'steepness';
}

export const cleanState: TrackViewerStateBase = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const trackViewerInitialState: TrackViewerState = {
  colorizeTrackBy: null,
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

        state.trackGeojson = action.payload.trackGeojson ?? state.trackGeojson;
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
        ) => trackViewer ?? trackViewerInitialState,
      ),
);
