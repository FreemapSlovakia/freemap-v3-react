import produce from 'immer';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import {
  distanceMeasurementAddPoint,
  distanceMeasurementUpdatePoint,
  distanceMeasurementRemovePoint,
  distanceMeasurementSetPoints,
  Point,
} from 'fm3/actions/distanceMeasurementActions';

export interface DistanceMeasurementState {
  points: Point[];
}

export const initialState: DistanceMeasurementState = {
  points: [],
};

export const distanceMeasurementReducer = createReducer<
  DistanceMeasurementState,
  RootAction
>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(distanceMeasurementAddPoint, (state, action) =>
    produce(state, draft => {
      draft.points.splice(
        action.payload.position === undefined
          ? state.points.length
          : action.payload.position,
        0,
        action.payload.point,
      );
    }),
  )
  .handleAction(distanceMeasurementUpdatePoint, (state, action) =>
    produce(state, draft => {
      draft.points[action.payload.index] = action.payload.point;
    }),
  )
  .handleAction(distanceMeasurementRemovePoint, (state, action) => ({
    ...state,
    points: state.points.filter(({ id }) => id !== action.payload),
  }))
  .handleAction(distanceMeasurementSetPoints, (state, action) => ({
    ...state,
    points: action.payload,
  }))
  .handleAction(deleteFeature, (state, action) =>
    action?.meta?.selection?.type === 'measure-dist' ? initialState : state,
  );
