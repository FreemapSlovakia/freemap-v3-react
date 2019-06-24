import { createStandardAction } from 'typesafe-actions';
import { LatLon } from 'fm3/types/common';

export const elevationMeasurementSetElevation = createStandardAction(
  'ELEVATION_MEASUREMENT_SET_ELEVATION',
)<number>();

export const elevationMeasurementSetPoint = createStandardAction(
  'ELEVATION_MEASUREMENT_SET_POINT',
)<LatLon | null>();
