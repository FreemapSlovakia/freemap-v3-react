export const CACHED_TILE_PATH_PREFIX = '/__cached__/';

export function toCachedLayerUrl(realTemplate: string, mapId: string): string {
  const pathFromTemplate = realTemplate.replace(/^https?:\/\/[^/]+/, '');

  return `${location.origin}${CACHED_TILE_PATH_PREFIX}${encodeURIComponent(mapId)}${pathFromTemplate}`;
}

export function parseCachedTileMapId(pathname: string): string | null {
  if (!pathname.startsWith(CACHED_TILE_PATH_PREFIX)) {
    return null;
  }

  const rest = pathname.slice(CACHED_TILE_PATH_PREFIX.length);

  const slashIdx = rest.indexOf('/');

  if (slashIdx <= 0) {
    return null;
  }

  return decodeURIComponent(rest.slice(0, slashIdx));
}
