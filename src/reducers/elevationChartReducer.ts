import { RootAction } from 'fm3/actions';
import {
  distanceMeasurementAddPoint,
  distanceMeasurementUpdatePoint,
  distanceMeasurementRemovePoint,
} from 'fm3/actions/distanceMeasurementActions';
import {
  elevationChartRemoveActivePoint,
  elevationChartSetActivePoint,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';
import { setTool } from 'fm3/actions/mainActions';
import { routePlannerSetResult } from 'fm3/actions/routePlannerActions';
import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';

export interface IElevationProfilePoint extends LatLon {
  climbUp: number;
  climbDown: number;
  distance: number;
  ele: number;
}

export interface IElevationChartState {
  trackGeojson: any;
  activePoint: {
    lat: number | null;
    lon: number | null;
    ele: number | null;
    distance: number | null;
  };
  elevationProfilePoints: Array<IElevationProfilePoint> | null;
}

const initialState: IElevationChartState = {
  trackGeojson: null,
  activePoint: {
    lat: null,
    lon: null,
    ele: null,
    distance: null,
  },
  elevationProfilePoints: null,
};

export const elevationChartReducer = createReducer<
  IElevationChartState,
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
    activePoint: initialState.activePoint,
  }))
  .handleAction(elevationChartSetElevationProfile, (state, action) => ({
    ...state,
    elevationProfilePoints: action.payload,
  }))
  .handleAction(setTool, setInitialState)
  .handleAction(routePlannerSetResult, setInitialState)
  .handleAction(distanceMeasurementAddPoint, setInitialState)
  .handleAction(distanceMeasurementUpdatePoint, setInitialState)
  .handleAction(distanceMeasurementRemovePoint, setInitialState)
  .handleAction(elevationChartClose, setInitialState);

function setInitialState() {
  return initialState;
}
