export function mapReset() {
  return { type: 'MAP_RESET' };
}

let sn = []; // HACK safety net to prevent endless loop in case of some error

export function mapRefocus(changes) {
  const now = Date.now();
  sn = sn.filter(time => now - time < 1000);
  sn.push(now);
  if (sn.length > 10) {
    throw new Error();
  }

  return { type: 'MAP_REFOCUS', payload: { ...changes } };
}

export function mapSetTileFormat(tileFormat) {
  return { type: 'MAP_SET_TILE_FORMAT', payload: tileFormat };
}

export function mapSetOverlayOpacity(overlayType, overlayOpacity) {
  return { type: 'MAP_SET_OVERLAY_OPACITY', overlayType, overlayOpacity };
}

export function mapLoadState(payload) {
  return { type: 'MAP_LOAD_STATE', payload };
}
