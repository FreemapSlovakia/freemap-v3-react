import { createStandardAction } from 'typesafe-actions';

export const elevationMeasurementSetElevation = createStandardAction(
  'ELEVATION_MEASUREMENT_SET_ELEVATION',
)<number>();

export const elevationMeasurementSetPoint = createStandardAction(
  'ELEVATION_MEASUREMENT_SET_POINT',
)<{ lat: number; lon: number }>();
