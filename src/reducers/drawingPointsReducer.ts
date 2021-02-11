import { RootAction } from 'fm3/actions';
import {
  DrawingPoint,
  drawingPointAdd,
  drawingPointChangePosition,
  drawingPointSetAll,
} from 'fm3/actions/drawingPointActions';
import { clearMap } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import produce from 'immer';
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
  .handleAction(clearMap, () => initialState)
  .handleAction(drawingPointAdd, (state, action) => ({
    ...state,
    points: [...state.points, action.payload],
    change: state.change + 1,
  }))
  .handleAction(drawingPointChangePosition, (state, action) =>
    produce(state, (draft) => {
      const point = draft.points[action.payload.index];
      point.lat = action.payload.lat;
      point.lon = action.payload.lon;
    }),
  )
  .handleAction(drawingPointSetAll, (state, action) => ({
    ...state,
    points: action.payload,
  }))
  .handleAction(mapsDataLoaded, (_state, action) => {
    return {
      ...initialState,
      points: action.payload.points ?? initialState.points,
    };
  });
