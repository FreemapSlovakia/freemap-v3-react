import { applySettings, clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  drawingChangePropertiesBatch,
  type PointChange,
} from '../actions/drawingBatchActions.js';
import {
  type DrawingPoint,
  drawingPointAdd,
  drawingPointChangePosition,
  drawingPointChangeProperties,
  drawingPointDelete,
  drawingPointSetAll,
  normalizeProps,
} from '../actions/drawingPointActions.js';

export interface DrawingPointsState {
  points: DrawingPoint[];
  change: number;
}

function changePoint(
  state: DrawingPointsState,
  { index, properties }: { index: number; properties: PointChange },
): void {
  const point = state.points[index];

  if (!point) {
    return;
  }

  Object.assign(point, properties);

  point.props = normalizeProps(point.props);
}

const initialState: DrawingPointsState = {
  points: [],
  change: 0,
};

export const drawingPointsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    .addCase(drawingPointDelete, (state, { payload }) => ({
      ...state,
      points: state.points.filter((_, i) => i !== payload.index),
    }))
    .addCase(applySettings, (state, { payload }) => {
      if (!payload.drawingApplyAll) {
        return;
      }

      const { drawing } = payload;

      for (const point of state.points) {
        Object.assign(point, drawing);
      }
    })
    .addCase(drawingPointAdd, (state, { payload }) => {
      state.points.push(payload);

      state.change++;
    })
    .addCase(drawingPointChangeProperties, (state, { payload }) => {
      changePoint(state, payload);
    })
    .addCase(drawingChangePropertiesBatch, (state, { payload }) => {
      for (const change of payload.points) {
        changePoint(state, change);
      }
    })
    .addCase(drawingPointChangePosition, (state, { payload }) => {
      const point = state.points[payload.index];

      point.coords = payload.coords;
    })
    .addCase(drawingPointSetAll, (state, { payload }) => {
      state.points = payload;
    })
    .addCase(mapsLoaded, (state, { payload }) => {
      return {
        ...initialState,
        points: [
          ...(payload.merge ? state.points : []),
          ...(payload.data.points ?? initialState.points),
        ],
      };
    }),
);
