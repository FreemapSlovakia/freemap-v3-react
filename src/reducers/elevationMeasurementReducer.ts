import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import {
  elevationMeasurementSetElevation,
  elevationMeasurementSetPoint,
} from 'fm3/actions/elevationMeasurementActions';

export interface ElevationMeasurementState {
  elevation: number | null;
  point: LatLon | null;
}

const initialState: ElevationMeasurementState = {
  elevation: null,
  point: null,
};

export const elevationMeasurementReducer = createReducer<
  ElevationMeasurementState,
  RootAction
>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(elevationMeasurementSetElevation, (state, action) => ({
    ...state,
    elevation: action.payload,
  }))
  .handleAction(elevationMeasurementSetPoint, (state, action) => ({
    ...state,
    point: action.payload,
    elevation: null,
  }))
  .handleAction(deleteFeature, (state, action) =>
    action?.meta?.selection?.type === 'measure-ele' ? initialState : state,
  );
