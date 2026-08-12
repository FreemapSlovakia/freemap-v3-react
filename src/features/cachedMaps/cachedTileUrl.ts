export const CACHED_TILE_PATH_PREFIX = '/__cached__/';

export function toCachedLayerUrl(realTemplate: string, mapId: string): string {
  const pathFromTemplate = realTemplate.replace(/^https?:\/\/[^/]+/, '');

  return `${location.origin}${CACHED_TILE_PATH_PREFIX}${encodeURIComponent(mapId)}${pathFromTemplate}`;
}

/**
 * Splits a `/__cached__/<id>/<path>` pathname into the map it addresses and the
 * path below it — which is the source layer's own path, since
 * `toCachedLayerUrl` replaces nothing but the origin.
 */
export function parseCachedTilePath(
  pathname: string,
): { mapId: string; path: string } | null {
  if (!pathname.startsWith(CACHED_TILE_PATH_PREFIX)) {
    return null;
  }

  const rest = pathname.slice(CACHED_TILE_PATH_PREFIX.length);

  const slashIdx = rest.indexOf('/');

  if (slashIdx <= 0) {
    return null;
  }

  return {
    mapId: decodeURIComponent(rest.slice(0, slashIdx)),
    path: rest.slice(slashIdx),
  };
}
