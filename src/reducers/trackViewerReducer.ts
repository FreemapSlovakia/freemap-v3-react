import {
  FeatureCollection,
  Geometries,
  GeometryCollection,
} from '@turf/helpers';
import { RootAction } from 'fm3/actions';
import { clearMapFeatures } from 'fm3/actions/mainActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import { osmClear } from 'fm3/actions/osmActions';
import {
  trackViewerColorizeTrackBy,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import { createReducer } from 'typesafe-actions';

export interface TrackViewerStateBase {
  trackGeojson: FeatureCollection<Geometries | GeometryCollection> | null;
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

export const trackViewerReducer = createReducer<TrackViewerState, RootAction>(
  trackViewerInitialState,
)
  .handleAction(clearMapFeatures, () => trackViewerInitialState)
  .handleAction(trackViewerSetData, (state, action) => ({
    ...state,
    trackGpx: action.payload.trackGpx ?? state.trackGpx,
    trackGeojson: action.payload.trackGeojson ?? state.trackGeojson,
  }))
  .handleAction(trackViewerSetTrackUID, (state, action) => ({
    ...state,
    trackUID: action.payload,
  }))
  .handleAction(trackViewerDownloadTrack, (state, action) => ({
    ...state,
    trackUID: action.payload,
  }))
  .handleAction(trackViewerColorizeTrackBy, (state, action) => ({
    ...state,
    colorizeTrackBy: action.payload,
  }))
  .handleAction(trackViewerGpxLoad, (state, action) => ({
    ...state,
    gpxUrl: action.payload,
  }))
  .handleAction(osmClear, () => trackViewerInitialState)
  .handleAction(
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
  );
