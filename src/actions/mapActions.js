export function setTool(tool) {
  return { type: 'SET_TOOL', tool };
}

export function setMapCenter({ lat, lon }) {
  return { type: 'SET_MAP_CENTER', center: { lat, lon } };
}

export function setMapZoom(zoom) {
  return { type: 'SET_MAP_ZOOM', zoom };
}

export function setMapType(mapType) {
  return { type: 'SET_MAP_TYPE', mapType };
}

export function setMapOverlays(overlays) {
  return { type: 'SET_MAP_OVERLAYS', overlays };
}
