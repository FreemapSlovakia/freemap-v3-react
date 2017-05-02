export function areaMeasurementAddPoint(point, position) {
  return { type: 'AREA_MEASUREMENT_ADD_POINT', payload: { point, position } };
}

export function areaMeasurementUpdatePoint(index, point) {
  return { type: 'AREA_MEASUREMENT_UPDATE_POINT', payload: { index, point } };
}

export function areaMeasurementRemovePoint(index) {
  return { type: 'AREA_MEASUREMENT_REMOVE_POINT', payload: { index } };
}
