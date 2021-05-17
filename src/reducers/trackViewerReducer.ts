import { FeatureCollection, Geometries } from '@turf/helpers';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import {
  osmClear,
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import {
  trackViewerColorizeTrackBy,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';

export interface TrackViewerStateBase {
  trackGeojson: FeatureCollection<Geometries> | null;
  trackGpx: string | null;
  trackUID: string | null;
  gpxUrl: string | null;

  osmNodeId: number | null;
  osmWayId: number | null;
  osmRelationId: number | null;
  eleSmoothingFactor?: number;
}

export interface TrackViewerState extends TrackViewerStateBase {
  colorizeTrackBy: null | 'elevation' | 'steepness';
}

export const cleanState: TrackViewerStateBase = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
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
    return trackViewer ?? trackViewerInitialState;
  });
