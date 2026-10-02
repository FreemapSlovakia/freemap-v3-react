import type { CachedTileMapDef } from '@features/cachedMaps/cachedTileMaps.js';
import type { Shading } from '@features/parameterizedShading/model/Shading.js';
import { createAction } from '@reduxjs/toolkit';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { type Shortcut, ShortcutSchema } from '@shared/types/common.js';
import z from 'zod';
import type { MapCombination } from './mapCombination.js';

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
  installed: z.boolean().optional(),
  opacity: z.number().optional(),
  showInMenu: z.boolean().optional(),
  showInToolbar: z.boolean().optional(),
  shortcut: ShortcutSchema.nullish(),
});

export type LayerSettings = {
  /** False takes a library map out of every list, shortcut and the finder; links still show it. */
  installed?: boolean;
  opacity?: number;
  showInMenu?: boolean;
  showInToolbar?: boolean;
  shortcut?: Shortcut | null;
};

/** Changes one map's settings at once; the account catches up in the background. */
export const mapLayerSettingsChange = createAction<{
  type: string;
  settings: LayerSettings;
}>('MAP_LAYER_SETTINGS_CHANGE');

/** Puts every map's settings back to the defaults, keeping what is installed. */
export const mapLayersSettingsReset = createAction('MAP_LAYERS_SETTINGS_RESET');

/** The overlays' stacking order, top first, as dragged in Installed maps. */
export const mapOverlayOrderSet = createAction<string[]>(
  'MAP_OVERLAY_ORDER_SET',
);

/**
 * Adds or replaces a custom map, with its own settings when given. Like the
 * actions below it changes the store at once and the account catches up.
 */
export const mapCustomLayerSave = createAction<{
  def: CustomLayerDef;
  settings?: LayerSettings;
  /** The saved toast offers to switch the map on. */
  offerActivate?: boolean;
}>('MAP_CUSTOM_LAYER_SAVE');

/** Removes a custom map and its settings. */
export const mapCustomLayerDelete = createAction<{ type: string }>(
  'MAP_CUSTOM_LAYER_DELETE',
);

/** Adds or replaces a map combination, with its own settings when given. */
export const mapCombinationSave = createAction<{
  combination: MapCombination;
  settings?: LayerSettings;
}>('MAP_COMBINATION_SAVE');

/** Removes a map combination and its settings. */
export const mapCombinationDelete = createAction<{ id: string }>(
  'MAP_COMBINATION_DELETE',
);

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
  minZoom?: number;
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

/** The shared shading; ends its draft. */
export const mapSetShading = createAction<Shading>('MAP_SET_SHADING');

/**
 * An edit of the shared shading the server does not render until applied;
 * `undefined` drops it.
 */
export const mapSetSharedShadingDraft = createAction<Shading | undefined>(
  'MAP_SET_SHARED_SHADING_DRAFT',
);

/** Whether shading layers are rendered on the server rather than in the browser. */
export const mapSetShadingOnServer = createAction<boolean>(
  'MAP_SET_SHADING_ON_SERVER',
);

/** An unsaved edit of a custom map's own shading; `undefined` drops it. */
export const mapSetShadingDraft = createAction<{
  type: string;
  shading?: Shading;
}>('MAP_SET_SHADING_DRAFT');

/**
 * Puts a map combination's layers and shading on the map. `toggle` takes an
 * active overlay-only one off instead, as its checkbox does; `replaces` is its
 * previous version, whose layers go first.
 */
export const mapApplyCombination = createAction<{
  id: string;
  toggle?: boolean;
  replaces?: MapCombination;
}>('MAP_APPLY_COMBINATION');

export const mapSetLocalPrefs = createAction<{
  resolutionScale?: number | null;
  featureScale?: number;
  zoomSnap?: number;
}>('MAP_SET_LOCAL_PREFS');

export const mapSetBounds =
  createAction<[number, number, number, number]>('MAP_SET_BOUNDS');

export const mapSetCountries = createAction<string[] | null | undefined>(
  'MAP_SET_COUNTRIES',
);
