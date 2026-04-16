import { createAction } from '@reduxjs/toolkit';
import type { CachedTileMapDef } from '@shared/cachedTileMaps.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';

export interface CacheTilesStartPayload {
  id: string;
  name: string;
  sourceType: string;
  technology: 'tile' | 'wms';
  urlTemplate: string;
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number];
  tileCount: number;
  extraScales?: number[];
  scaleWithDpi?: boolean;
  attribution?: AttributionDef[];
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
