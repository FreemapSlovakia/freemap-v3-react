export function elevationMeasurementSetElevation(elevation) {
  return { type: 'ELEVATION_MEASUREMENT_SET_ELEVATION', payload: elevation };
}

export function elevationMeasurementSetPoint(point) {
  return { type: 'ELEVATION_MEASUREMENT_SET_POINT', payload: point };
}
