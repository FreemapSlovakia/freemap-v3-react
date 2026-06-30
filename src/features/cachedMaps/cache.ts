import { maybeClearStaticCache } from '@shared/offlineStaticCache.js';
import { del, get, set } from 'idb-keyval';
import type { CachedTileMapDef } from './cachedTileMaps.js';

const CACHED_TILE_MAPS_KEY = 'cachedTileMaps';

export async function getCachedTileMaps(): Promise<CachedTileMapDef[]> {
  return (await get<CachedTileMapDef[]>(CACHED_TILE_MAPS_KEY)) ?? [];
}

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
