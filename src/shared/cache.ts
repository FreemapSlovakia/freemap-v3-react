import type { CachedTileMapDef } from '@shared/cachedTileMaps.js';
import { del, get, set } from 'idb-keyval';

const STATIC_CACHE_NAME = 'offline-static';

const CACHED_TILE_MAPS_KEY = 'cachedTileMaps';

export async function cacheStaticAssets(): Promise<void> {
  const cache = await caches.open(STATIC_CACHE_NAME);

  const res = await fetch('./assets-manifest.json');

  const data = await res.json();

  await cache.addAll([...new Set(Object.values(data) as string[])]);
}

export async function isStaticCacheReady(): Promise<boolean> {
  return caches.has(STATIC_CACHE_NAME);
}

export async function clearStaticCache(): Promise<void> {
  await caches.delete(STATIC_CACHE_NAME);
}

export async function getCachedTileMaps(): Promise<CachedTileMapDef[]> {
  return (await get<CachedTileMapDef[]>(CACHED_TILE_MAPS_KEY)) ?? [];
}

export async function saveCachedTileMap(meta: CachedTileMapDef): Promise<void> {
  const maps = await getCachedTileMaps();

  const idx = maps.findIndex((m) => m.id === meta.id);

  if (idx >= 0) {
    maps[idx] = meta;
  } else {
    maps.push(meta);
  }

  await set(CACHED_TILE_MAPS_KEY, maps);
}

export async function deleteCachedTileMap(id: string): Promise<void> {
  const maps = await getCachedTileMaps();

  const meta = maps.find((m) => m.id === id);

  if (meta) {
    await caches.delete(meta.cacheName);
  }

  const remaining = maps.filter((m) => m.id !== id);

  if (remaining.length === 0) {
    await del(CACHED_TILE_MAPS_KEY);

    await clearStaticCache();
  } else {
    await set(CACHED_TILE_MAPS_KEY, remaining);
  }
}
