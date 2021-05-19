import {
  FeatureCollection,
  Geometries,
  GeometryCollection,
} from '@turf/helpers';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
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

  eleSmoothingFactor?: number;
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
  eleSmoothingFactor: undefined, // TODO to settings reducer

  ...cleanState,
};

export const trackViewerReducer = createReducer<TrackViewerState, RootAction>(
  trackViewerInitialState,
)
  .handleAction(clearMap, () => trackViewerInitialState)
  .handleAction(trackViewerSetData, (state, action) => ({
    ...state,
    ...action.payload,
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
  .handleAction(mapsDataLoaded, (_state, { payload: { trackViewer } }) => {
    return trackViewer ?? trackViewerInitialState;
  });
