export function buildTileUrl(
  urlTemplate: string,
  x: number,
  y: number,
  z: number,
): string {
  return urlTemplate
    .replace('{x}', String(x))
    .replace('{y}', String(y))
    .replace('{z}', String(z))
    .replace('{s}', 'a');
}

/**
 * The `@Nx` variant that a screen of the given DPI gets, or `undefined` when the
 * layer has no hi-DPI variants and plain 1× tiles are fetched.
 */
export function pickTileScale(
  extraScales: number[] | undefined,
  dpr: number = window.devicePixelRatio || 1,
): number | undefined {
  return extraScales
    ?.filter((s) => s <= Math.ceil(dpr))
    .sort((a, b) => b - a)[0];
}

/** Appends the `@Nx` suffix that `ScaledTileLayer` uses for hi-DPI tiles. */
export function withTileScale(url: string, scale: number | undefined): string {
  return scale === undefined ? url : `${url}@${scale}x`;
}
