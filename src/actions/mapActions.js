export function mapReset() {
  return { type: 'MAP_RESET' };
}

export function mapRefocus(changes) {
  return { type: 'MAP_REFOCUS', payload: { ...changes } };
}

export function mapSetTileFormat(tileFormat) {
  return { type: 'MAP_SET_TILE_FORMAT', payload: tileFormat };
}
