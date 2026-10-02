import { applySettings } from '@app/store/actions.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import {
  cachedMapDeleted,
  cachedMapEdited,
  cachedMapsLoaded,
  cacheTilesProgress,
  cacheTilesStart,
} from '@features/cachedMaps/model/actions.js';
import { gallerySetFilter } from '@features/gallery/model/actions.js';
import { processGeoipResult } from '@features/geoip/model/actions.js';
import { mapLibraryCatalogMapsLoaded } from '@features/mapLibrary/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import type { Shading } from '@features/parameterizedShading/model/Shading.js';
import { createReducer } from '@reduxjs/toolkit';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';
import {
  type LayerSettings,
  type MapStateBase,
  mapCombinationDelete,
  mapCombinationSave,
  mapCustomLayerDelete,
  mapCustomLayerSave,
  mapLayerSettingsChange,
  mapLayersSettingsReset,
  mapRefocus,
  mapReplaceLayer,
  mapSetBounds,
  mapSetCountries,
  mapSetCustomLayers,
  mapSetEsriAttribution,
  mapSetLocalPrefs,
  mapSetShading,
  mapSetShadingDraft,
  mapSetShadingOnServer,
  mapSetSharedShadingDraft,
  mapSuppressLegacyMapWarning,
  mapToggleLayer,
} from './actions.js';
import {
  activeCombinations,
  layerKinds,
  type MapCombination,
  withoutCombinations,
} from './mapCombination.js';
import { allLayerEntries } from './selectors.js';

export interface MapState extends MapStateBase {
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
  legacyMapWarningSuppressions: string[];
  tempLegacyMapWarningSuppressions: string[];
  esriAttribution: string[];
  maxZoom: number;
  resolutionScale: number | null;
  featureScale: number;
  zoomSnap: number;
  shading: Shading;
  /** Unsaved edits of custom maps' own shading, by layer type. */
  shadingDrafts: Record<string, Shading>;
  /** Unapplied edits of `shading`, while it is rendered on the server. */
  sharedShadingDraft?: Shading;
  shadingOnServer: boolean;
  mapCombinations: MapCombination[];
  /** The catalog maps wanted so far: installed, on the map or an offline map's source. */
  catalogMaps: CatalogMap[];
}

const LAT = 48.70714112;
const LON = 19.49950112;

export const mapInitialState: MapState = {
  layers: ['X'],
  lat: LAT,
  lon: LON,
  zoom: 8,
  layersSettings: {},
  removeGalleryOverlayOnGalleryToolQuit: false,
  gpsTracked: false,
  customLayers: [],
  cachedMaps: [],
  legacyMapWarningSuppressions: [],
  tempLegacyMapWarningSuppressions: [],
  esriAttribution: [],
  maxZoom: 20,
  resolutionScale: null,
  featureScale: 1,
  zoomSnap: 1,
  // As `gdaldem hillshade` draws it: 315°, 45°, z 1, grey over black.
  shading: {
    backgroundColor: [0x00, 0x00, 0x00, 1],
    components: [
      {
        id: 1,
        type: 'hillshade-classic',
        elevation: 45 * (Math.PI / 180),
        azimuth: 315 * (Math.PI / 180),
        brightness: 0,
        contrast: 1,
        colorStops: [{ value: 0, color: [0xff, 0xff, 0xff, 1] }],
        exaggeration: 1,
      },
    ],
  },
  shadingDrafts: {},
  shadingOnServer: true,
  mapCombinations: [],
  catalogMaps: [],
  // undefined = not yet fetched (unknown coverage); [] would wrongly mean
  // "covers no country" and flash out-of-coverage warnings during initial load
  countries: undefined,
};

/**
 * A zoom on its way into the store, pulled onto the grid the `zoomSnap`
 * preference defines (0 = no grid). Same arithmetic Leaflet's own `_limitZoom`
 * uses, so the two agree on where a zoom belongs.
 *
 * Needed because a zoom can arrive off-grid from outside — a link written under
 * a finer setting, or a saved map. Leaflet would snap the view to the same
 * place, but the `setView` doing so counts as a programmatic move and is
 * therefore not synced back, which would otherwise leave the store and the URL
 * off what is on screen until the next time the user touched the map.
 */
function acceptZoom(state: MapState, zoom: number): number {
  const { zoomSnap } = state;

  return zoomSnap ? Math.round(zoom / zoomSnap) * zoomSnap : zoom;
}

type AccountSettings = Pick<
  MapState,
  'layersSettings' | 'customLayers' | 'mapCombinations' | 'maxZoom'
>;

/**
 * The account's settings, of which this slice is the only copy: a save sends
 * them all, the API storing them whole.
 */
export const accountSettingsOf = (map: MapState): AccountSettings => ({
  layersSettings: map.layersSettings,
  customLayers: map.customLayers,
  mapCombinations: map.mapCombinations,
  maxZoom: map.maxZoom,
});

/** Whether this map's shading draft is what it has saved. */
export const isShadingDraftSaved = (
  def: CustomLayerDef,
  draft: Shading | undefined,
): boolean =>
  def.technology === 'parametricShading' &&
  JSON.stringify(def.shading) === JSON.stringify(draft);

/** A draft ends once saved, or with its map. */
function endSavedShadingDrafts(state: MapState) {
  for (const [type, draft] of Object.entries(state.shadingDrafts)) {
    const def = state.customLayers.find((def) => def.type === type);

    if (!def || isShadingDraftSaved(def, draft)) {
      delete state.shadingDrafts[type];
    }
  }
}

/** Replaces the item with the same key in place, or appends it. */
function upsert<T>(items: T[], item: T, same: (a: T) => boolean) {
  const i = items.findIndex(same);

  if (i === -1) {
    items.push(item);
  } else {
    items[i] = item;
  }
}

function mergeLayerSettings(
  state: MapState,
  type: string,
  settings: LayerSettings | undefined,
) {
  if (settings) {
    state.layersSettings[type] = { ...state.layersSettings[type], ...settings };
  }
}

/** Each key given replaces the slice's, even when empty. */
function assignAccountSettings(
  state: MapState,
  settings: Partial<AccountSettings>,
) {
  if (settings.layersSettings) {
    state.layersSettings = settings.layersSettings;
  }

  if (settings.customLayers) {
    state.customLayers = settings.customLayers;

    endSavedShadingDrafts(state);
  }

  if (settings.mapCombinations) {
    state.mapCombinations = settings.mapCombinations;
  }

  if (settings.maxZoom !== undefined) {
    state.maxZoom = settings.maxZoom;
  }
}

// Not passed to whoever signs in next.
const resetAccountSettings = (state: MapState) =>
  assignAccountSettings(state, accountSettingsOf(mapInitialState));

export const mapReducer = createReducer(mapInitialState, (builder) =>
  builder
    .addCase(mapSuppressLegacyMapWarning, (state, action) => {
      state[
        action.payload.forever
          ? 'legacyMapWarningSuppressions'
          : 'tempLegacyMapWarningSuppressions'
      ].push(action.payload.type);
    })
    .addCase(applySettings, (state, { payload }) => {
      assignAccountSettings(state, payload);
    })
    .addCase(mapLibraryCatalogMapsLoaded, (state, { payload }) => {
      for (const map of payload) {
        if (!state.catalogMaps.some((known) => known.type === map.type)) {
          state.catalogMaps.push(map);
        }
      }
    })
    .addCase(mapLayerSettingsChange, (state, { payload }) => {
      mergeLayerSettings(state, payload.type, payload.settings);
    })
    .addCase(mapCustomLayerSave, (state, { payload: { def, settings } }) => {
      upsert(state.customLayers, def, (d) => d.type === def.type);

      mergeLayerSettings(state, def.type, settings);
    })
    .addCase(mapCustomLayerDelete, (state, { payload: { type } }) => {
      state.customLayers = state.customLayers.filter((d) => d.type !== type);

      delete state.layersSettings[type];

      endSavedShadingDrafts(state);
    })
    .addCase(
      mapCombinationSave,
      (state, { payload: { combination, settings } }) => {
        upsert(
          state.mapCombinations,
          combination,
          (c) => c.id === combination.id,
        );

        mergeLayerSettings(state, combination.id, settings);
      },
    )
    .addCase(mapCombinationDelete, (state, { payload: { id } }) => {
      state.mapCombinations = state.mapCombinations.filter((c) => c.id !== id);

      delete state.layersSettings[id];
    })
    .addCase(mapLayersSettingsReset, (state) => {
      state.layersSettings = Object.fromEntries(
        Object.entries(state.layersSettings).flatMap(([type, { installed }]) =>
          installed === undefined ? [] : [[type, { installed }]],
        ),
      );
    })
    .addCase(gallerySetFilter, (state) => {
      if (!state.layers.includes('I')) {
        state.layers.push('I');
      }
    })
    .addCase(mapReplaceLayer, (state, { payload: { from, to } }) => {
      const idx = state.layers.indexOf(from);

      if (idx > -1) {
        state.layers[idx] = to;
      }
    })
    .addCase(mapToggleLayer, (state, { payload: { type, enable } }) => {
      // TODO can cache (use selector?)
      const kinds = layerKinds(
        allLayerEntries(
          state.customLayers,
          state.cachedMaps,
          state.catalogMaps,
        ),
      );

      if (kinds.get(type) === 'base' && enable !== false) {
        // "Make sure it's on" (the zoom-to-coverage buttons): no pick, so a
        // combination on it stays.
        if (enable === true && state.layers.includes(type)) {
          return;
        }

        const active = activeCombinations(
          state.mapCombinations,
          state.layers,
          kinds,
        );

        // Picking a plain base map, even the combination's own, leaves a
        // combination that has one and takes its overlays off; overlay-only
        // ones stay.
        const left = active.filter((c) => c.base !== undefined);

        if (left.length) {
          state.layers = withoutCombinations(state.layers, left, active);
        }

        if (state.layers.includes(type)) {
          return;
        }

        state.layers = [
          type,
          ...state.layers.filter((layer) => kinds.get(layer) !== 'base'),
        ];
      }
      // overlay
      else {
        const layersSet = new Set(state.layers);

        if (layersSet.has(type)) {
          if (enable !== true) {
            layersSet.delete(type);
          }
        } else if (enable !== false) {
          layersSet.add(type);
        }

        state.layers = [...layersSet];
      }
    })
    .addCase(
      mapRefocus,
      (state, { payload: { zoom, lat, lon, layers, gpsTracked } }) => {
        // Zoom 0 is a zoom like any other — the world layers go down to it, so
        // the `-` button, the `-` key and a fit to a world-spanning extent all
        // ask for it. Finite, because one caller reads its zoom off a DOM
        // dataset attribute.
        if (zoom !== undefined && Number.isFinite(zoom)) {
          state.zoom = acceptZoom(state, zoom);
        }

        if (lat !== undefined) {
          state.lat = lat;
        }

        if (lon !== undefined) {
          state.lon = lon;
        }

        if (layers) {
          state.layers = layers;
        }

        if (
          gpsTracked !== undefined ||
          (lat !== undefined && lon !== undefined)
        ) {
          state.gpsTracked = Boolean(gpsTracked);
        }
      },
    )
    .addCase(authSetUser, (state, action) => {
      // A session that turned out to be over, as signing out.
      if (!action.payload) {
        resetAccountSettings(state);

        return;
      }

      // Each key the account has wins, even empty, so a deletion elsewhere
      // holds; one it lacks keeps what was set signed out.
      if (action.payload.settings) {
        assignAccountSettings(state, action.payload.settings);
      }
    })
    .addCase(authLogout, resetAccountSettings)
    .addCase(
      mapsLoaded,
      (
        state,
        {
          payload: {
            data: { map },
          },
        },
      ) => ({
        ...state,
        pristinePosition: false,
        lat: map?.lat ?? state.lat,
        lon: map?.lon ?? state.lon,
        zoom:
          map?.zoom === undefined ? state.zoom : acceptZoom(state, map.zoom),
        layers: map?.layers ?? state.layers,
        customLayers: map?.customLayers ?? state.customLayers,
        // Drafts belong to the replaced custom maps, whose types may be reused.
        shadingDrafts: map?.customLayers ? {} : state.shadingDrafts,
        shading: map?.shading ?? state.shading,
        sharedShadingDraft: map?.shading ? undefined : state.sharedShadingDraft,
      }),
    )
    .addCase(mapSetCustomLayers, (state, action) => {
      state.customLayers = action.payload;
    })
    .addCase(mapSetEsriAttribution, (state, action) => {
      state.esriAttribution = action.payload;
    })
    .addCase(mapSetBounds, (state, action) => {
      state.bounds = action.payload;
    })
    .addCase(mapSetCountries, (state, action) => {
      state.countries = action.payload;
    })
    .addCase(mapSetShadingDraft, (state, { payload: { type, shading } }) => {
      if (shading) {
        state.shadingDrafts[type] = shading;
      } else {
        delete state.shadingDrafts[type];
      }
    })
    .addCase(mapSetShading, (state, action) => {
      state.shading = action.payload;

      state.sharedShadingDraft = undefined;
    })
    .addCase(mapSetSharedShadingDraft, (state, action) => {
      state.sharedShadingDraft = action.payload;
    })
    .addCase(mapSetShadingOnServer, (state, action) => {
      state.shadingOnServer = action.payload;

      // The browser draws every edit as it is made, so the draft is simply taken.
      if (!action.payload && state.sharedShadingDraft) {
        state.shading = state.sharedShadingDraft;

        state.sharedShadingDraft = undefined;
      }
    })
    .addCase(mapSetLocalPrefs, (state, { payload }) => {
      if (payload.resolutionScale !== undefined) {
        state.resolutionScale = payload.resolutionScale;
      }

      if (payload.featureScale !== undefined) {
        state.featureScale = payload.featureScale;
      }

      if (payload.zoomSnap !== undefined) {
        state.zoomSnap = payload.zoomSnap;

        // A coarser grid leaves the map between two of its levels, which the
        // store may no longer hold.
        state.zoom = acceptZoom(state, state.zoom);
      }
    })
    .addCase(processGeoipResult, (state, { payload }) => {
      if (state.lat !== LAT || state.lon !== LON) {
        return;
      }

      if (payload.latitude !== undefined && payload.longitude !== undefined) {
        state.lat = payload.latitude;
        state.lon = payload.longitude;
        state.zoom = 9;
      }
    })
    .addCase(cachedMapsLoaded, (state, action) => {
      state.cachedMaps = action.payload;
    })
    .addCase(cacheTilesStart, (state, { payload }) => {
      state.cachedMaps.push(payload);
    })
    .addCase(cacheTilesProgress, (state, { payload }) => {
      const i = state.cachedMaps.findIndex((m) => m.type === payload.type);

      if (i >= 0) {
        state.cachedMaps[i] = payload;
      }
    })
    .addCase(cachedMapDeleted, (state, { payload }) => {
      state.cachedMaps = state.cachedMaps.filter((m) => m.type !== payload.id);

      state.layers = state.layers.filter((l) => l !== payload.id);
    })
    .addCase(cachedMapEdited, (state, { payload }) => {
      const i = state.cachedMaps.findIndex((m) => m.type === payload.next.type);

      if (i >= 0) {
        state.cachedMaps[i] = payload.next;
      }
    }),
);
