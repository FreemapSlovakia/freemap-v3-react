export function setElevation(elevation) {
  return { type: 'SET_ELEVATION', payload: elevation };
}

export function setPoint(point) {
  return { type: 'SET_ELEVATION_POINT', payload: point };
}
