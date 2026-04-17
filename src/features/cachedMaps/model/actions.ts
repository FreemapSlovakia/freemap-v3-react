import { createAction } from '@reduxjs/toolkit';
import type { CachedTileMapDef } from '@shared/cachedTileMaps.js';

export interface CacheTilesStartPayload {
  /** The full CachedTileMapDef with downloadedCount=0 and sizeBytes=0 */
  meta: CachedTileMapDef;
  boundary:
    | { type: 'bbox'; bounds: [number, number, number, number] }
    | { type: 'polygon'; points: { lat: number; lon: number }[] };
}

export const cacheTilesStart =
  createAction<CacheTilesStartPayload>('CACHE_TILES_START');

export const cacheTilesProgress = createAction<{
  id: string;
  downloaded: number;
  sizeBytes: number;
}>('CACHE_TILES_PROGRESS');

export const cacheTilesComplete = createAction<{ id: string }>(
  'CACHE_TILES_COMPLETE',
);

export const cacheTilesPause = createAction<{ id: string }>(
  'CACHE_TILES_PAUSE',
);

export const cacheTilesResume = createAction<{ id: string }>(
  'CACHE_TILES_RESUME',
);

export const cacheTilesCancel = createAction<{ id: string }>(
  'CACHE_TILES_CANCEL',
);

export const cacheTilesRestart = createAction<{ id: string }>(
  'CACHE_TILES_RESTART',
);

export const cacheTilesError = createAction<{ id: string; error: string }>(
  'CACHE_TILES_ERROR',
);

export const cachedMapsLoaded =
  createAction<CachedTileMapDef[]>('CACHED_MAPS_LOADED');

export const cachedMapDeleted = createAction<{ id: string }>(
  'CACHED_MAP_DELETED',
);

export const cachedMapsSetView = createAction<'list' | 'add'>(
  'CACHED_MAPS_SET_VIEW',
);
