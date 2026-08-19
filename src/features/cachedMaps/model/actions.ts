import { createAction } from '@reduxjs/toolkit';
import type { BrowseCacheConfig, BrowseCacheStats } from '../browseCache.js';
import type { CachedTileMapDef } from '../cachedTileMaps.js';

/** Payload is the full CachedTileMapDef with downloadedCount=0 and sizeBytes=0. */
export const cacheTilesStart =
  createAction<CachedTileMapDef>('CACHE_TILES_START');

/**
 * The map's metadata as caching has it now — the same object that goes to
 * IndexedDB, so the store can't drift from it. Carries the counters the
 * progress bar reads, and the `@Nx` variant that had to be resolved for a map
 * whose metadata recorded none.
 */
export const cacheTilesProgress = createAction<CachedTileMapDef>(
  'CACHE_TILES_PROGRESS',
);

export const cacheTilesComplete = createAction<{ id: string }>(
  'CACHE_TILES_COMPLETE',
);

/**
 * Halts the caching pass, keeping the map and whatever it has cached so far.
 * Discarding it altogether is what {@link cachedMapDeleted} is for.
 */
export const cacheTilesStop = createAction<{ id: string }>('CACHE_TILES_STOP');

/**
 * Resumes a map left incomplete by an interrupted pass. The counters come along
 * so the progress bar starts from what the map already holds.
 */
export const cacheTilesRestart = createAction<{
  id: string;
  downloaded: number;
  total: number;
  sizeBytes: number;
}>('CACHE_TILES_RESTART');

export const cacheTilesError = createAction<{ id: string; error: string }>(
  'CACHE_TILES_ERROR',
);

export const cachedMapsLoaded =
  createAction<CachedTileMapDef[]>('CACHED_MAPS_LOADED');

export const cachedMapDeleted = createAction<{ id: string }>(
  'CACHED_MAP_DELETED',
);

/**
 * A changed area / zoom range / name. `prev` is what the map covered before, so
 * the tiles that fall outside `next` can be enumerated and dropped.
 */
export const cachedMapEdited = createAction<{
  prev: CachedTileMapDef;
  next: CachedTileMapDef;
}>('CACHED_MAP_EDITED');

export const cachedMapsSetView = createAction<
  'list' | 'add' | { edit: string }
>('CACHED_MAPS_SET_VIEW');

export const cachedMapsSetSettings = createAction<Partial<BrowseCacheConfig>>(
  'CACHED_MAPS_SET_SETTINGS',
);

/** Empties the browse cache, settings untouched. */
export const browseCacheCleared = createAction('BROWSE_CACHE_CLEARED');

/** What the browse cache holds; `null` while it has yet to be read. */
export const browseCacheStatsLoaded = createAction<BrowseCacheStats | null>(
  'BROWSE_CACHE_STATS_LOADED',
);
