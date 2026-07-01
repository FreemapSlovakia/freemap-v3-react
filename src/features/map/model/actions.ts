import type { CachedTileMapDef } from '@features/cachedMaps/cachedTileMaps.js';
import { Shading } from '@features/parameterizedShading/model/Shading.js';
import { createAction } from '@reduxjs/toolkit';
import { CustomLayerDef } from '@shared/mapDefinitions.js';
import { Shortcut, ShortcutSchema } from '@shared/types/common.js';
import z from 'zod';

export interface MapViewState {
  lat: number;
  lon: number;
  zoom: number;
  layers: string[];
  bounds?: [number, number, number, number];
  // undefined = coverage not yet fetched, null = fetch failed, [] = fetched
  // (covers no known country), string[] = fetched country codes
  countries?: string[] | null;
}

export const LayerSettingsSchema = z.object({
  opacity: z.number().optional(),
  showInMenu: z.boolean().optional(),
  showInToolbar: z.boolean().optional(),
  shortcut: ShortcutSchema.nullish(),
});

export type LayerSettings = {
  opacity?: number;
  showInMenu?: boolean;
  showInToolbar?: boolean;
  shortcut?: Shortcut | null;
};

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  customLayers: CustomLayerDef[];
  cachedMaps: CachedTileMapDef[];
}

export const mapRefocus = createAction<
  Partial<MapViewState> & { gpsTracked?: boolean }
>('MAP_REFOCUS');

/** Fit the map to a [west, south, east, north] bbox, clamped to maxZoom. */
export const mapFitBbox = createAction<{
  bbox: [number, number, number, number];
  maxZoom?: number;
}>('MAP_FIT_BBOX');

export const mapReplaceLayer = createAction<{ from: string; to: string }>(
  'MAP_REPLACE_LAYER',
);

export const mapToggleLayer = createAction<{ type: string; enable?: boolean }>(
  'MAP_TOGGLE_LAYER',
);

export const mapSuppressLegacyMapWarning = createAction<{
  type: string;
  forever: boolean;
}>('MAP_SUPPRESS_LEGACY_MAP_WARING');

export const mapSetCustomLayers = createAction<CustomLayerDef[]>(
  'MAP_SET_CUSTOM_LAYERS',
);

export const mapSetEsriAttribution = createAction<string[]>(
  'MAP_SET_ESRI_ATTRIBUTION',
);

export const mapSetShading = createAction<Shading>('MAP_SET_SHADING');

export const mapSetLocalPrefs = createAction<{
  resolutionScale?: number | null;
  featureScale?: number;
}>('MAP_SET_LOCAL_PREFS');

export const mapSetBounds =
  createAction<[number, number, number, number]>('MAP_SET_BOUNDS');

export const mapSetCountries = createAction<string[] | null | undefined>(
  'MAP_SET_COUNTRIES',
);
