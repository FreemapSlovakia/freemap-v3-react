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
 * The `@Nx` variant that a screen of the given DPI gets, or `1` when the layer
 * has no hi-DPI variant that fits and plain tiles are fetched.
 */
export function pickTileScale(
  extraScales: number[] | undefined,
  dpr: number = window.devicePixelRatio || 1,
): number {
  return (
    extraScales?.filter((s) => s <= Math.ceil(dpr)).sort((a, b) => b - a)[0] ??
    1
  );
}

/**
 * Appends the `@Nx` suffix that `ScaledTileLayer` uses for hi-DPI tiles. Scale 1
 * is the plain URL — there is no `@1x` variant.
 */
export function withTileScale(url: string, scale: number | undefined): string {
  return scale === undefined || scale === 1 ? url : `${url}@${scale}x`;
}
