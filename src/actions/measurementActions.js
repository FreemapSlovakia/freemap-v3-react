export function addPoint(point) {
  return { type: 'ADD_MEASUREMENT_POINT', point };
}

export function updatePoint(index, point) {
  return { type: 'UPDATE_MEASUREMENT_POINT', index, point };
}
