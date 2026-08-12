/**
 * The subdomain a fetched tile is asked from. `{s}` exists to spread a map view
 * over several hosts, which a fetch one tile at a time has no use for — but the
 * name still has to resolve, and not every layer's subdomains are letters.
 */
export function pickSubdomain(
  subdomains: string | string[] | undefined,
): string {
  return (
    (typeof subdomains === 'string' ? subdomains[0] : subdomains?.[0]) ?? 'a'
  );
}

export function buildTileUrl(
  urlTemplate: string,
  x: number,
  y: number,
  z: number,
  subdomain = 'a',
): string {
  return urlTemplate
    .replace('{x}', String(x))
    .replace('{y}', String(y))
    .replace('{z}', String(z))
    .replace('{s}', subdomain);
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
