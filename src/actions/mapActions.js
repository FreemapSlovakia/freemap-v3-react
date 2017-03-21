export function resetMap() {
  return { type: 'RESET_MAP' };
}

export function refocusMap(changes) {
  return { type: 'REFOCUS', payload: { ...changes } };
}

export function setMapTileFormat(tileFormat) {
  return { type: 'SET_MAP_TILE_FORMAT', payload: tileFormat };
}
