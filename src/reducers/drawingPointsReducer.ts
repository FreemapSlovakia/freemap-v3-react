import { RootAction } from 'fm3/actions';
import {
  DrawingPoint,
  drawingPointAdd,
  drawingPointChangePosition,
  drawingPointChangeProperties,
  drawingPointDelete,
  drawingPointSetAll,
} from 'fm3/actions/drawingPointActions';
import { applySettings, clearMapFeatures } from 'fm3/actions/mainActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import { produce } from 'immer';
import { createReducer } from 'typesafe-actions';

export interface DrawingPointsState {
  points: DrawingPoint[];
  change: number;
}

const initialState: DrawingPointsState = {
  points: [],
  change: 0,
};

export const drawingPointsReducer = createReducer<
  DrawingPointsState,
  RootAction
>(initialState)
  .handleAction(clearMapFeatures, () => initialState)
  .handleAction(drawingPointDelete, (state, { payload }) => ({
    ...state,
    points: state.points.filter((_, i) => i !== payload.index),
  }))
  .handleAction(applySettings, (state, { payload }) =>
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
  .handleAction(drawingPointAdd, (state, { payload }) => ({
    ...state,
    points: [...state.points, payload],
    change: state.change + 1,
  }))
  .handleAction(drawingPointChangeProperties, (state, { payload }) =>
    produce(state, (draft) => {
      Object.assign(draft.points[payload.index], payload.properties);
    }),
  )
  .handleAction(drawingPointChangePosition, (state, { payload }) =>
    produce(state, (draft) => {
      const point = draft.points[payload.index];

      point.lat = payload.lat;

      point.lon = payload.lon;
    }),
  )
  .handleAction(drawingPointSetAll, (state, { payload }) => ({
    ...state,
    points: payload,
  }))
  .handleAction(mapsLoaded, (state, { payload }) => {
    return {
      ...initialState,
      points: [
        ...(payload.merge ? state.points : []),
        ...(payload.data.points ?? initialState.points),
      ],
    };
  });
