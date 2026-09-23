/**
 * Every host a layer's `{s}` can resolve to, in the order Leaflet cycles them.
 * A layer that names none gets Leaflet's own default.
 */
export function tileSubdomains(
  subdomains: string | string[] | undefined,
): string[] {
  return [...(subdomains?.length ? subdomains : 'abc')];
}

/**
 * The subdomain a fetched tile is asked from. `{s}` exists to spread a map view
 * over several hosts, which a fetch one tile at a time has no use for — but the
 * name still has to resolve.
 */
export function pickSubdomain(
  subdomains: string | string[] | undefined,
): string {
  return tileSubdomains(subdomains)[0];
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

/**
 * What {@link withTileScale} appends, as a pattern. One home for the grammar:
 * a tile looked for under a spelling it wasn't written with is simply not found.
 */
export const TILE_SCALE_SUFFIX = String.raw`@\d+(?:\.\d+)?x`;

/** Strips the `@Nx` suffix, giving the URL of the same tile at scale 1. */
export function stripTileScale(url: string): string {
  return url.replace(new RegExp(`${TILE_SCALE_SUFFIX}$`), '');
}

/**
 * Marks a tile the map is drawing, as against one a download or the size
 * sampler asked for — all three fetch the same URL, and nothing else tells the
 * service worker which is which. See `doc/tile-attribution.md`.
 */
export const TILE_DRAW_PARAM = 'fm-draw';

export function markDrawnTile(url: string): string {
  // ahead of any fragment, or the query it is added to is not one
  const hash = url.indexOf('#');

  const base = hash < 0 ? url : url.slice(0, hash);

  return `${base}${base.includes('?') ? '&' : '?'}${TILE_DRAW_PARAM}=1${
    hash < 0 ? '' : url.slice(hash)
  }`;
}

/**
 * The same tile without the marker. Everything a cache keys by goes through
 * this: a tile browsed and a tile downloaded are one tile, and a key carrying
 * the marker would orphan everything stored before it existed.
 */
export function unmarkDrawnTile(url: string): string {
  return url.replace(
    new RegExp(`([?&])${TILE_DRAW_PARAM}=1(&|(?=#)|$)`),
    // Textual, so a protocol-relative template survives it — `new URL` would
    // not take one.
    (_, before: string, after: string) => (after ? before : ''),
  );
}
