import { del, get, set } from 'idb-keyval';
import type { CachedTileMapDef } from './cachedTileMaps.js';

const STATIC_CACHE_NAME = 'offline-static';

const CACHED_TILE_MAPS_KEY = 'cachedTileMaps';

const STATIC_MANIFEST_KEY = 'staticAssetsManifest';

async function fetchManifest(): Promise<Record<string, string>> {
  const res = await fetch('./assets-manifest.json');

  return res.json();
}

export async function cacheStaticAssets(): Promise<void> {
  const cache = await caches.open(STATIC_CACHE_NAME);

  const manifest = await fetchManifest();

  await cache.addAll([...new Set(Object.values(manifest))]);

  await set(STATIC_MANIFEST_KEY, manifest);
}

export async function isStaticCacheReady(): Promise<boolean> {
  return caches.has(STATIC_CACHE_NAME);
}

export async function clearStaticCache(): Promise<void> {
  await caches.delete(STATIC_CACHE_NAME);

  await del(STATIC_MANIFEST_KEY);
}

/**
 * Called on app startup.
 * - If no cached maps exist → delete static cache.
 * - If cached maps exist → diff manifest; prune stale + add new entries.
 */
export async function syncStaticCache(): Promise<void> {
  const maps = await getCachedTileMaps();

  if (maps.length === 0) {
    await clearStaticCache();

    return;
  }

  if (!navigator.onLine) {
    return;
  }

  let newManifest: Record<string, string>;

  try {
    newManifest = await fetchManifest();
  } catch {
    return;
  }

  const oldManifest =
    (await get<Record<string, string>>(STATIC_MANIFEST_KEY)) ?? {};

  const newUrls = new Set(Object.values(newManifest));
  const oldUrls = new Set(Object.values(oldManifest));

  const sameSize = newUrls.size === oldUrls.size;
  const allMatch =
    sameSize && [...newUrls].every((u) => oldUrls.has(u));

  if (allMatch) {
    return;
  }

  const cache = await caches.open(STATIC_CACHE_NAME);

  // prune removed URLs
  await Promise.all(
    [...oldUrls]
      .filter((u) => !newUrls.has(u))
      .map((u) => cache.delete(u)),
  );

  // add new URLs (ignore failures so one bad asset doesn't abort the whole sync)
  await Promise.all(
    [...newUrls]
      .filter((u) => !oldUrls.has(u))
      .map((u) => cache.add(u).catch(() => {})),
  );

  await set(STATIC_MANIFEST_KEY, newManifest);
}

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

    await clearStaticCache();
  } else {
    await set(CACHED_TILE_MAPS_KEY, remaining);
  }
}
