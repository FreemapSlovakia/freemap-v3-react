import { selectFeature, setTool, setTools } from '@app/store/actions.js';
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

// A waypoint paired onto the profile: its position on the distance axis and the
// elevation of the nearest track point, plus its name for the label.
export interface ElevationProfileWaypoint {
  distance: number;
  ele: number;
  label?: string;
}

export interface ElevationChartState {
  activePoint: ElevationProfilePoint | null;
  elevationProfilePoints: Array<ElevationProfilePoint> | null;
  waypoints: ElevationProfileWaypoint[];
}

const initialState: ElevationChartState = {
  activePoint: null,
  elevationProfilePoints: null,
  waypoints: [],
};

export const elevationChartReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(elevationChartSetTrackGeojson, () => initialState)
    .addCase(elevationChartSetActivePoint, (state, action) => {
      state.activePoint = action.payload;
    })
    .addCase(elevationChartSetElevationProfile, (state, action) => {
      state.elevationProfilePoints = action.payload.points;

      state.waypoints = action.payload.waypoints;
    })
    // Clear the chart when its owning tool is closed (or all tools are), not on
    // every setTool — other tools now open alongside route-planner/track-viewer.
    .addCase(setTool, (state, action) =>
      action.payload.mode === 'close' &&
      (action.payload.tool === 'route-planner' ||
        action.payload.tool === 'import-file')
        ? initialState
        : state,
    )
    .addCase(setTools, (state, action) =>
      action.payload.length === 0 ? initialState : state,
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
