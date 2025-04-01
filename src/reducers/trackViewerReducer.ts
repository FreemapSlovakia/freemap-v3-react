import { createReducer } from '@reduxjs/toolkit';
import { clearMapFeatures } from 'fm3/actions/mainActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import { osmClear } from 'fm3/actions/osmActions';
import {
  trackViewerColorizeTrackBy,
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import { FeatureCollection } from 'geojson';

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
      .addCase(trackViewerSetData, (state, action) => ({
        ...state,
        trackGpx: action.payload.trackGpx ?? state.trackGpx,
        trackGeojson: action.payload.trackGeojson ?? state.trackGeojson,
      }))
      .addCase(trackViewerSetTrackUID, (state, action) => ({
        ...state,
        trackUID: action.payload,
      }))
      .addCase(trackViewerDownloadTrack, (state, action) => ({
        ...state,
        trackUID: action.payload,
      }))
      .addCase(trackViewerColorizeTrackBy, (state, action) => ({
        ...state,
        colorizeTrackBy: action.payload,
      }))
      .addCase(trackViewerGpxLoad, (state, action) => ({
        ...state,
        gpxUrl: action.payload,
      }))
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
        ) => {
          return trackViewer ?? trackViewerInitialState;
        },
      ),
);
