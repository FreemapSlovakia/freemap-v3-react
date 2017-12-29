import * as at from 'fm3/actionTypes';

export function elevationMeasurementSetElevation(elevation) {
  return { type: at.ELEVATION_MEASUREMENT_SET_ELEVATION, payload: elevation };
}

export function elevationMeasurementSetPoint(point) {
  return { type: at.ELEVATION_MEASUREMENT_SET_POINT, payload: point };
}
