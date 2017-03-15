export function resetMap() {
  return { type: 'RESET_MAP' };
}

export function setMapBounds(bounds) {
  return { type: 'SET_MAP_BOUNDS', bounds };
}

export function refocusMap(changes) {
  return Object.assign({ type: 'REFOCUS' }, changes);
}

export function setMapTileFormat(tileFormat) {
  return { type: 'SET_MAP_TILE_FORMAT', tileFormat };
}
