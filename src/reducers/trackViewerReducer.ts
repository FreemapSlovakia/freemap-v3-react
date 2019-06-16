import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  trackViewerLoadState,
  trackViewerSetData,
  trackViewerSetTrackUID,
  trackViewerDownloadTrack,
  trackViewerColorizeTrackBy,
  trackViewerGpxLoad,
} from 'fm3/actions/trackViewerActions';
import {
  osmClear,
  osmLoadNode,
  osmLoadWay,
  osmLoadRelation,
} from 'fm3/actions/osmActions';

export interface ITrackViewerState {
  trackGeojson: object | null;
  trackGpx: object | null;
  trackUID: string | null;
  startPoints: LatLon[];
  finishPoints: LatLon[];
  colorizeTrackBy: null | 'elevation' | 'steepness';
  gpxUrl: string | null;

  osmNodeId: number | null;
  osmWayId: number | null;
  osmRelationId: number | null;
  eleSmoothingFactor?: number;
}

const initialState: ITrackViewerState = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  startPoints: [],
  finishPoints: [],
  colorizeTrackBy: null,
  gpxUrl: null, // TODO to separate reducer (?)

  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
  eleSmoothingFactor: undefined,
};

export default createReducer<ITrackViewerState, RootAction>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(trackViewerLoadState, (state, action) => {
    const s = { ...state };
    const { eleSmoothingFactor } = action.payload;
    if (eleSmoothingFactor) {
      s.eleSmoothingFactor = eleSmoothingFactor;
    }
    return s;
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
  }));
