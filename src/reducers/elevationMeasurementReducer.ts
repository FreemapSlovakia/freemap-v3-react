import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  elevationMeasurementSetElevation,
  elevationMeasurementSetPoint,
} from 'fm3/actions/elevationMeasurementActions';

interface IElevationMeasurementState {
  elevation: number | null;
  point: LatLon | null;
}

const initialState: IElevationMeasurementState = {
  elevation: null,
  point: null,
};

export default createReducer<IElevationMeasurementState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(elevationMeasurementSetElevation, (state, action) => ({
    ...state,
    elevation: action.payload,
  }))
  .handleAction(elevationMeasurementSetPoint, (state, action) => ({
    ...state,
    point: action.payload,
    elevation: null,
  }));
