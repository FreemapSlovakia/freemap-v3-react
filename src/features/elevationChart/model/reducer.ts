import { createReducer } from '@reduxjs/toolkit';
import {
  drawingLineAddPoint,
  drawingLineRemovePoint,
  drawingLineUpdatePoint,
} from '../../drawing/model/actions/drawingLineActions.js';
import {
  elevationChartClose,
  elevationChartSetActivePoint,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from '../../../actions/elevationChartActions.js';
import { selectFeature, setTool } from '../../../actions/mainActions.js';
import { routePlannerSetResult } from '../../routePlanner/model/actions.js';
import type { LatLon } from '../../../types/common.js';

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
    .addCase(elevationChartSetActivePoint, (state, action) => {
      state.activePoint = action.payload;
    })
    .addCase(elevationChartSetElevationProfile, (state, action) => {
      state.elevationProfilePoints = action.payload;
    })
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
