export function distanceMeasurementAddPoint(point, position) {
  return { type: 'DISTANCE_MEASUREMENT_ADD_POINT', payload: { point, position } };
}

export function distanceMeasurementUpdatePoint(index, point) {
  return { type: 'DISTANCE_MEASUREMENT_UPDATE_POINT', payload: { index, point } };
}

export function distanceMeasurementRemovePoint(index) {
  return { type: 'DISTANCE_MEASUREMENT_REMOVE_POINT', payload: { index } };
}

export function distanceMeasurementExportGpx() {
  return { type: 'DISTANCE_MEASUREMENT_EXPORT_GPX' };
}
