import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import {
  drawingPointAdd,
  drawingPointChangePosition,
  drawingPointSetAll,
  DrawingPoint,
} from 'fm3/actions/drawingPointActions';
import produce from 'immer';

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
  .handleAction(clearMap, () => initialState)
  .handleAction(drawingPointAdd, (state, action) => ({
    ...state,
    points: [...state.points, action.payload],
    change: state.change + 1,
  }))
  .handleAction(drawingPointChangePosition, (state, action) =>
    produce(state, draft => {
      const point = draft.points[action.payload.index];
      point.lat = action.payload.lat;
      point.lon = action.payload.lon;
    }),
  )
  .handleAction(drawingPointSetAll, (state, action) => ({
    ...state,
    points: action.payload,
  }))
  .handleAction(deleteFeature, (state, action) =>
    produce(state, draft => {
      if (
        action.payload.type === 'draw-points' &&
        action.payload.id !== undefined
      )
        draft.points.splice(action.payload.id, 1);
    }),
  );
