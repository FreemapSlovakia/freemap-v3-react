import { createAction } from 'typesafe-actions';
import { LatLon } from 'fm3/types/common';

export const elevationMeasurementSetElevation = createAction(
  'ELEVATION_MEASUREMENT_SET_ELEVATION',
)<number | null>();

export const elevationMeasurementSetPoint = createAction(
  'ELEVATION_MEASUREMENT_SET_POINT',
)<LatLon | null>();
