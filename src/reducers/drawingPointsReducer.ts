import { createReducer } from '@reduxjs/toolkit';
import { produce } from 'immer';
import {
  DrawingPoint,
  drawingPointAdd,
  drawingPointChangePosition,
  drawingPointChangeProperties,
  drawingPointDelete,
  drawingPointSetAll,
} from '../actions/drawingPointActions.js';
import { applySettings, clearMapFeatures } from '../actions/mainActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';

export interface DrawingPointsState {
  points: DrawingPoint[];
  change: number;
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
    .addCase(applySettings, (state, { payload }) =>
      produce(state, (draft) => {
        if (payload.drawingApplyAll) {
          for (const point of draft.points) {
            if (payload.drawingColor) {
              point.color = payload.drawingColor;
            }
          }
        }
      }),
    )
    .addCase(drawingPointAdd, (state, { payload }) => ({
      ...state,
      points: [...state.points, payload],
      change: state.change + 1,
    }))
    .addCase(drawingPointChangeProperties, (state, { payload }) =>
      produce(state, (draft) => {
        Object.assign(draft.points[payload.index], payload.properties);
      }),
    )
    .addCase(drawingPointChangePosition, (state, { payload }) =>
      produce(state, (draft) => {
        const point = draft.points[payload.index];

        point.lat = payload.lat;

        point.lon = payload.lon;
      }),
    )
    .addCase(drawingPointSetAll, (state, { payload }) => ({
      ...state,
      points: payload,
    }))
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
