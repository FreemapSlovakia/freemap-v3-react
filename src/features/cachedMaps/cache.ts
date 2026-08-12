import { maybeClearStaticCache } from '@shared/offlineStaticCache.js';
import { del, get, set } from 'idb-keyval';
import type { CachedTileMapDef } from './cachedTileMaps.js';

const CACHED_TILE_MAPS_KEY = 'cachedTileMaps';

export async function getCachedTileMaps(): Promise<CachedTileMapDef[]> {
  return (await get<CachedTileMapDef[]>(CACHED_TILE_MAPS_KEY)) ?? [];
}

/** Adds the map, or replaces the stored copy of one already there. */
export async function saveCachedTileMap(meta: CachedTileMapDef): Promise<void> {
  const maps = await getCachedTileMaps();

  const idx = maps.findIndex((m) => m.type === meta.type);

  if (idx >= 0) {
    maps[idx] = meta;
  } else {
    maps.push(meta);
  }

  await set(CACHED_TILE_MAPS_KEY, maps);
}

/**
 * Replaces the stored copy of a map, doing nothing if it is no longer there.
 * What a caching pass writes its progress through: a delete can land while the
 * pass is mid-batch, and re-adding the map it just removed would leave a ghost
 * entry with no tiles behind it.
 */
export async function updateCachedTileMap(
  meta: CachedTileMapDef,
): Promise<void> {
  const maps = await getCachedTileMaps();

  const idx = maps.findIndex((m) => m.type === meta.type);

  if (idx < 0) {
    return;
  }

  maps[idx] = meta;

  await set(CACHED_TILE_MAPS_KEY, maps);
}

export async function deleteCachedTileMap(id: string): Promise<void> {
  const maps = await getCachedTileMaps();

  const meta = maps.find((m) => m.type === id);

  if (meta) {
    await caches.delete(meta.cacheName);
  }

  const remaining = maps.filter((m) => m.type !== id);

  if (remaining.length === 0) {
    await del(CACHED_TILE_MAPS_KEY);

    await maybeClearStaticCache();
  } else {
    await set(CACHED_TILE_MAPS_KEY, remaining);
  }
}
