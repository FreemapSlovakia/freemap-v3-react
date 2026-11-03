/**
 * The tile density pixel-exact drawing fetches: of the two whole densities
 * around the screen's, the one fewer zoom-levels away from it.
 */
export function pixelExactScale(dpr = window.devicePixelRatio || 1): number {
  const below = Math.floor(dpr);

  return below < 1 || dpr * dpr > below * (below + 1) ? below + 1 : below;
}

// Under half a level, or Leaflet would draw the next tile level; null past it.
function exactOffset(dpr: number): number | null {
  const offset = Math.log2(pixelExactScale(dpr) / dpr);

  return Math.abs(offset) < 0.5 ? offset : null;
}

/**
 * How far the zoom grid sits off whole levels. Pixel-exact shifts it so that a
 * tile level is shown at `pixelExactScale / dpr`, one tile pixel per device
 * pixel.
 */
export function zoomGridOffset(
  pixelExact: boolean,
  dpr = window.devicePixelRatio || 1,
): number {
  return (pixelExact && exactOffset(dpr)) || 0;
}

/** The density raster tiles are fetched for. */
export function tileDensity(
  pixelExact: boolean,
  resolutionScale: number | null,
  dpr: number,
): number {
  return pixelExact && exactOffset(dpr) !== null
    ? pixelExactScale(dpr)
    : (resolutionScale ?? dpr);
}

/** `zoom` pulled onto the `snap` grid (0 = none) shifted by `offset`. */
export function snapZoom(zoom: number, snap: number, offset: number): number {
  return snap ? Math.round((zoom - offset) / snap) * snap + offset : zoom;
}
