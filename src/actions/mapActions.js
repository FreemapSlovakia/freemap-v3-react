import * as at from 'fm3/actionTypes';

export function mapReset() {
  return { type: at.MAP_RESET };
}

let sn = []; // HACK safety net to prevent endless loop in case of some error

export function mapRefocus(changes) {
  const now = Date.now();
  sn = sn.filter(time => now - time < 1000);
  sn.push(now);
  if (sn.length > 10) {
    throw new Error('endless loop detected');
  }

  return { type: at.MAP_REFOCUS, payload: { ...changes } };
}

export function mapSetTileFormat(tileFormat) {
  return { type: at.MAP_SET_TILE_FORMAT, payload: tileFormat };
}

export function mapSetOverlayOpacity(overlayOpacity) {
  return { type: at.MAP_SET_OVERLAY_OPACITY, payload: overlayOpacity };
}

export function mapSetOverlayPaneOpacity(overlayPaneOpacity) {
  return { type: at.MAP_SET_OVERLAY_PANE_OPACITY, payload: overlayPaneOpacity };
}

export function mapLoadState(payload) {
  return { type: at.MAP_LOAD_STATE, payload };
}

export function mapSetStravaAuth(payload) {
  return { type: at.MAP_SET_STRAVA_AUTH, payload };
}
