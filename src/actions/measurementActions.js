export function measurementAddPoint(point, position) {
  return { type: 'MEASUREMENT_ADD_POINT', payload: { point, position } };
}

export function measurementUpdatePoint(index, point) {
  return { type: 'MEASUREMENT_UPDATE_POINT', payload: { index, point } };
}

export function measurementRemovePoint(index) {
  return { type: 'MEASUREMENT_REMOVE_POINT', payload: { index } };
}
