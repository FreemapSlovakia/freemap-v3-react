import { RootAction } from 'fm3/actions';
import {
  drawingLineAddPoint,
  drawingLineUpdatePoint,
  drawingLineRemovePoint,
} from 'fm3/actions/drawingActions';
import {
  elevationChartRemoveActivePoint,
  elevationChartSetActivePoint,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';
import { selectFeature } from 'fm3/actions/mainActions';
import { routePlannerSetResult } from 'fm3/actions/routePlannerActions';
import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';

export interface ElevationProfilePoint extends LatLon {
  climbUp?: number;
  climbDown?: number;
  distance: number;
  ele: number;
}

export interface ElevationChartState {
  trackGeojson: any;
  activePoint: ElevationProfilePoint | null;
  elevationProfilePoints: Array<ElevationProfilePoint> | null;
}

const initialState: ElevationChartState = {
  trackGeojson: null,
  activePoint: null,
  elevationProfilePoints: null,
};

export const elevationChartReducer = createReducer<
  ElevationChartState,
  RootAction
>(initialState)
  .handleAction(elevationChartSetTrackGeojson, (state, action) => ({
    ...state,
    trackGeojson: action.payload,
  }))
  .handleAction(elevationChartSetActivePoint, (state, action) => ({
    ...state,
    activePoint: action.payload,
  }))
  .handleAction(elevationChartRemoveActivePoint, state => ({
    ...state,
    activePoint: null,
  }))
  .handleAction(elevationChartSetElevationProfile, (state, action) => ({
    ...state,
    elevationProfilePoints: action.payload,
  }))
  .handleAction(selectFeature, setInitialState)
  .handleAction(routePlannerSetResult, setInitialState)
  .handleAction(drawingLineAddPoint, setInitialState)
  .handleAction(drawingLineUpdatePoint, setInitialState)
  .handleAction(drawingLineRemovePoint, setInitialState)
  .handleAction(elevationChartClose, setInitialState);

function setInitialState() {
  return initialState;
}
