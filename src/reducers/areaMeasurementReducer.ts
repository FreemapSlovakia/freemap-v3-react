import produce from 'immer';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import {
  areaMeasurementAddPoint,
  areaMeasurementUpdatePoint,
  areaMeasurementRemovePoint,
  areaMeasurementSetPoints,
  Point,
} from 'fm3/actions/areaMeasurementActions';

export interface AreaMeasurementState {
  points: Point[];
}

const initialState: AreaMeasurementState = {
  points: [],
};

export const areaMeasurementReducer = createReducer<
  AreaMeasurementState,
  RootAction
>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(areaMeasurementAddPoint, (state, action) =>
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
  .handleAction(areaMeasurementUpdatePoint, (state, { payload: { point } }) =>
    produce(state, draft => {
      const p = draft.points.find(p => p.id === point.id);
      if (p) {
        Object.assign(p, point);
      }
    }),
  )
  .handleAction(areaMeasurementRemovePoint, (state, action) => ({
    ...state,
    points: state.points.filter(({ id }) => id !== action.payload),
  }))
  .handleAction(areaMeasurementSetPoints, (state, action) => ({
    ...state,
    points: action.payload,
  }))
  .handleAction(deleteFeature, (state, action) =>
    action.payload?.type === 'measure-area' ? initialState : state,
  );
