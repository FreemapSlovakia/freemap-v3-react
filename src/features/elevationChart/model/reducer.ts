import { selectFeature, setTool } from '@app/store/actions.js';
import {
  drawingLineAddPoint,
  drawingLineRemovePoint,
  drawingLineUpdatePoint,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { routePlannerSetResult } from '@features/routePlanner/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import {
  elevationChartClose,
  elevationChartSetActivePoint,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from './actions.js';

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
