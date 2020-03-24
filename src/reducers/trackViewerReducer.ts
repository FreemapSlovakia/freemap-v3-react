import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap, setAppState, deleteFeature } from 'fm3/actions/mainActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
  trackViewerDownloadTrack,
  trackViewerColorizeTrackBy,
  trackViewerGpxLoad,
  TrackPoint,
} from 'fm3/actions/trackViewerActions';
import {
  osmClear,
  osmLoadNode,
  osmLoadWay,
  osmLoadRelation,
} from 'fm3/actions/osmActions';
import { FeatureCollection } from 'geojson';
import produce from 'immer';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';

export interface TrackViewerState {
  trackGeojson: FeatureCollection | null;
  trackGpx: string | null;
  trackUID: string | null;
  startPoints: TrackPoint[];
  finishPoints: TrackPoint[];
  colorizeTrackBy: null | 'elevation' | 'steepness';
  gpxUrl: string | null;

  osmNodeId: number | null;
  osmWayId: number | null;
  osmRelationId: number | null;
  eleSmoothingFactor?: number;
}

export const cleanState = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  startPoints: [],
  finishPoints: [],
  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

const initialState: TrackViewerState = {
  colorizeTrackBy: null,
  eleSmoothingFactor: undefined, // TODO to settings reducer

  ...cleanState,
};

export const trackViewerReducer = createReducer<TrackViewerState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(setAppState, (state, action) => {
    return { ...state, ...action.payload.trackViewer };
  })
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
  .handleAction(osmClear, () => initialState)
  .handleAction(osmLoadNode, (state, action) => ({
    ...state,
    osmNodeId: action.payload,
  }))
  .handleAction(osmLoadWay, (state, action) => ({
    ...state,
    osmWayId: action.payload,
  }))
  .handleAction(osmLoadRelation, (state, action) => ({
    ...state,
    osmRelationId: action.payload,
  }))
  .handleAction(deleteFeature, (state, action) =>
    action.payload.type === 'map-details' ||
    action.payload.type === 'track-viewer'
      ? {
          ...initialState,
          colorizeTrackBy: state.colorizeTrackBy,
          eleSmoothingFactor: state.eleSmoothingFactor,
        }
      : state,
  )
  .handleAction(searchSelectResult, (state, action) =>
    produce(state, (draft) => {
      draft.osmNodeId = null;
      draft.osmWayId = null;
      draft.osmRelationId = null;

      switch (action.payload?.osmType) {
        case 'node':
          draft.osmNodeId = action.payload.id;
          break;
        case 'way':
          draft.osmWayId = action.payload.id;
          break;
        case 'relation':
          draft.osmRelationId = action.payload.id;
          break;
      }
    }),
  )
  .handleAction(mapsDataLoaded, (_state, { payload: { trackViewer } }) => {
    return trackViewer ?? initialState;
  });
