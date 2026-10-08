import type { CachedTileMapDef } from '@features/cachedMaps/cachedTileMaps.js';
import type { Shading } from '@features/parameterizedShading/model/Shading.js';
import { createAction } from '@reduxjs/toolkit';
import type {
  NamedMapDef,
  StoredCustomLayerDef,
} from '@shared/mapDefinitions.js';
import { type Shortcut, ShortcutSchema } from '@shared/types/common.js';
import z from 'zod';
import type { LayerSetup } from './layerSetup.js';
import type { MapPreset } from './mapPreset.js';

export interface MapViewState {
  lat: number;
  lon: number;
  zoom: number;
  /**
   * Bottom first: the base map, then the overlays as they stack. A map is its
   * id, a preset `@<id>` (see `presetItem`).
   */
  layers: string[];
  bounds?: [number, number, number, number];
  // undefined = coverage not yet fetched, null = fetch failed, [] = fetched
  // (covers no known country), string[] = fetched country codes
  countries?: string[] | null;
}

/** Where a map or a preset is offered: what Installed maps sets. */
export const LayerSettingsSchema = z.object({
  installed: z.boolean().optional(),
  showInMenu: z.boolean().optional(),
  showInToolbar: z.boolean().optional(),
  shortcut: ShortcutSchema.nullish(),
});

/** By map id, an entry that doesn't parse left out on its own. */
export const LayersSettingsCompatSchema = z
  .record(z.string(), z.unknown())
  .transform((entries) =>
    Object.fromEntries(
      Object.entries(entries).flatMap(([type, settings]) => {
        const ok = LayerSettingsSchema.safeParse(settings);

        return ok.success ? [[type, ok.data]] : [];
      }),
    ),
  );

export type LayerSettings = {
  /** False takes a library map out of every list, shortcut and the finder; links still show it. */
  installed?: boolean;
  showInMenu?: boolean;
  showInToolbar?: boolean;
  shortcut?: Shortcut | null;
};

/** Changes where one map is offered; the account catches up in the background. */
export const mapLayerSettingsChange = createAction<{
  type: string;
  settings: LayerSettings;
}>('MAP_LAYER_SETTINGS_CHANGE');

/** Puts every map's settings and setup back to the defaults, keeping what is installed. */
export const mapLayersSettingsReset = createAction('MAP_LAYERS_SETTINGS_RESET');

/** A map's own setup, or with `preset` that preset's copy of it. */
export type SetupTarget = { type: string; preset?: string };

/**
 * Changes a setup: each field given replaces its own, `undefined` drops it. A
 * map on the map switched to a base map takes the base map's place.
 */
export const mapLayerSetupChange = createAction<
  SetupTarget & { setup: Partial<LayerSetup> }
>('MAP_LAYER_SETUP_CHANGE');

/** Puts a setup back to the map's defaults. */
export const mapLayerSetupReset = createAction<SetupTarget>(
  'MAP_LAYER_SETUP_RESET',
);

/**
 * Moves an item of the stack, or with `preset` a layer of that preset: `to` is
 * the one it takes the place of.
 */
export const mapOverlayMove = createAction<{
  type: string;
  to: string;
  preset?: string;
}>('MAP_OVERLAY_MOVE');

/**
 * Adds or replaces a custom map, with its own settings when given. Like the
 * actions below it changes the store at once and the account catches up.
 */
export const mapCustomLayerSave = createAction<{
  def: StoredCustomLayerDef;
  settings?: LayerSettings;
  /** The saved toast offers to switch the map on. */
  offerActivate?: boolean;
}>('MAP_CUSTOM_LAYER_SAVE');

/**
 * Names a map as one drawing of it is set up (`from`, a map on its own or a
 * preset's copy): the named map takes its shading, WMS layers or colour and
 * its kind, and its place there.
 */
export const mapNamedMapCreate = createAction<{
  def: NamedMapDef;
  settings?: LayerSettings;
  from: SetupTarget;
}>('MAP_NAMED_MAP_CREATE');

/** Removes a custom map, its settings and its setup. */
export const mapCustomLayerDelete = createAction<{ type: string }>(
  'MAP_CUSTOM_LAYER_DELETE',
);

/**
 * Adds or replaces a map preset, with its own settings when given. `onMap`
 * puts it in place of the layers it was made of; `replacing` in place of the
 * link's preset it is a copy of.
 */
export const mapPresetSave = createAction<{
  preset: MapPreset;
  settings?: LayerSettings;
  onMap?: boolean;
  replacing?: string;
}>('MAP_PRESET_SAVE');

/** Removes a map preset, from the map too, and its settings. */
export const mapPresetDelete = createAction<{ id: string }>(
  'MAP_PRESET_DELETE',
);

/**
 * Turns a preset on or off, as `mapToggleLayer` does a map: one with a base
 * map takes the base map's place, one without goes on top.
 */
export const mapPresetToggle = createAction<{ id: string; enable?: boolean }>(
  'MAP_PRESET_TOGGLE',
);

/** Changes a preset's own fields; each given replaces its own. */
export const mapPresetChange = createAction<{
  id: string;
  change: Partial<Pick<MapPreset, 'opacity'>>;
}>('MAP_PRESET_CHANGE');

/** Adds a map to a preset; a base map replaces the preset's own. */
export const mapPresetLayerAdd = createAction<{ id: string; type: string }>(
  'MAP_PRESET_LAYER_ADD',
);

/** Takes a map out of a preset. */
export const mapPresetLayerRemove = createAction<{ id: string; type: string }>(
  'MAP_PRESET_LAYER_REMOVE',
);

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  /** How each map is drawn, whether on or off; see `LayerSetup`. */
  layerSetups: Record<string, LayerSetup>;
  customLayers: StoredCustomLayerDef[];
  cachedMaps: CachedTileMapDef[];
}

/**
 * Moves the map, or replaces its layers; `setups` replace those of the maps
 * they name (what a link carries), an empty one meaning defaults, and
 * `linkPresets` the presets a link brought.
 */
export const mapRefocus = createAction<
  Partial<MapViewState> & {
    gpsTracked?: boolean;
    setups?: Record<string, LayerSetup>;
    linkPresets?: MapPreset[];
  }
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

/** Hides the tools' features, or shows them; the data layer toggles the same. */
export const mapSetFeaturesHidden = createAction<boolean>(
  'MAP_SET_FEATURES_HIDDEN',
);

/**
 * Takes an item of the stack (a map, or `@<id>` a preset) off the map, a base
 * one too: the map is then left without a base map, on purpose.
 */
export const mapLayerRemove = createAction<{ item: string }>(
  'MAP_LAYER_REMOVE',
);

export const mapSuppressLegacyMapWarning = createAction<{
  type: string;
  forever: boolean;
}>('MAP_SUPPRESS_LEGACY_MAP_WARING');

export const mapSetCustomLayers = createAction<StoredCustomLayerDef[]>(
  'MAP_SET_CUSTOM_LAYERS',
);

export const mapSetEsriAttribution = createAction<string[]>(
  'MAP_SET_ESRI_ATTRIBUTION',
);

/** Whether shading layers are rendered on the server rather than in the browser. */
export const mapSetShadingOnServer = createAction<boolean>(
  'MAP_SET_SHADING_ON_SERVER',
);

/**
 * An edit of a shading map's setup the server does not render until applied;
 * `undefined` drops it.
 */
export const mapSetShadingDraft = createAction<
  SetupTarget & { shading?: Shading }
>('MAP_SET_SHADING_DRAFT');

export const mapSetLocalPrefs = createAction<{
  resolutionScale?: number | null;
  featureScale?: number;
  zoomSnap?: number;
  backgroundColor?: string;
  backgroundCheckerboard?: boolean;
}>('MAP_SET_LOCAL_PREFS');

export const mapSetBounds =
  createAction<[number, number, number, number]>('MAP_SET_BOUNDS');

export const mapSetCountries = createAction<string[] | null | undefined>(
  'MAP_SET_COUNTRIES',
);
