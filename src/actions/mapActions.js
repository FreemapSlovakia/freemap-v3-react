export function restoreMapFromUrlParams(params) {
  return { type: 'RESTORE_FROM_URL_PARAMS', params };
}

export function setTool(tool) {
  return { type: 'SET_TOOL', tool };
}

export function resetMap() {
  return { type: 'RESET_MAP' };
}

export function setMapBounds(bounds) {
  return { type: 'SET_MAP_BOUNDS', bounds };
}

export function refocusMap(lat, lon, zoom) {
  return { type: 'REFOCUS', lat, lon, zoom };
}

export function setMapType(mapType) {
  return { type: 'SET_MAP_TYPE', mapType };
}

export function setMapOverlays(overlays) {
  return { type: 'SET_MAP_OVERLAYS', overlays };
}
