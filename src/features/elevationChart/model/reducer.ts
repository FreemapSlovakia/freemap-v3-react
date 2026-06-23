import { closeTool, selectFeature, setTool } from '@app/store/actions.js';
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
    // Clear the chart when its owning tool is closed (or all tools are), not on
    // every setTool — other tools now open alongside route-planner/track-viewer.
    .addCase(closeTool, (state, action) =>
      action.payload === 'route-planner' || action.payload === 'import-file'
        ? initialState
        : state,
    )
    .addCase(setTool, (state, action) =>
      action.payload === null ? initialState : state,
    )
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
