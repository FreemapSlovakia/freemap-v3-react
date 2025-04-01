import { createReducer } from '@reduxjs/toolkit';
import {
  drawingLineAddPoint,
  drawingLineRemovePoint,
  drawingLineUpdatePoint,
} from 'fm3/actions/drawingLineActions';
import {
  elevationChartClose,
  elevationChartSetActivePoint,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { selectFeature, setTool } from 'fm3/actions/mainActions';
import { routePlannerSetResult } from 'fm3/actions/routePlannerActions';
import { LatLon } from 'fm3/types/common';

export interface ElevationProfilePoint extends LatLon {
  climbUp?: number;
  climbDown?: number;
  distance: number;
  ele: number;
}

export interface ElevationChartState {
  activePoint: ElevationProfilePoint | null;
  elevationProfilePoints: Array<ElevationProfilePoint> | null;
}

const initialState: ElevationChartState = {
  activePoint: null,
  elevationProfilePoints: null,
};

export const elevationChartReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(elevationChartSetTrackGeojson, () => initialState)
    .addCase(elevationChartSetActivePoint, (state, action) => ({
      ...state,
      activePoint: action.payload,
    }))
    .addCase(elevationChartSetElevationProfile, (state, action) => ({
      ...state,
      elevationProfilePoints: action.payload,
    }))
    .addCase(setTool, setInitialState)
    .addCase(selectFeature, setInitialState)
    .addCase(routePlannerSetResult, setInitialState)
    .addCase(drawingLineAddPoint, setInitialState)
    .addCase(drawingLineUpdatePoint, setInitialState)
    .addCase(drawingLineRemovePoint, setInitialState)
    .addCase(elevationChartClose, setInitialState),
);

function setInitialState() {
  return initialState;
}
