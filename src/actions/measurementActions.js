export function measurementAddPoint(point) {
  return { type: 'MEASUREMENT_ADD_POINT', payload: { point } };
}

export function measurementUpdatePoint(index, point) {
  return { type: 'MEASUREMENT_UPDATE_POINT', payload: { index, point } };
}
