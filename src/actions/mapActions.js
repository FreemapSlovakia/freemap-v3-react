export function setTool(tool) {
  return { type: 'SET_TOOL', tool };
}

export function setMapBounds(bounds) {
  return { type: 'SET_MAP_BOUNDS', bounds };
}
