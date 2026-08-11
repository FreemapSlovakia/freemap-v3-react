import { applySettings } from '@app/store/actions.js';
import { authSetUser } from '@features/auth/model/actions.js';
import {
  cachedMapDeleted,
  cachedMapRenamed,
  cachedMapsLoaded,
  cacheTilesCancel,
  cacheTilesComplete,
  cacheTilesProgress,
  cacheTilesStart,
} from '@features/cachedMaps/model/actions.js';
import { gallerySetFilter } from '@features/gallery/model/actions.js';
import { processGeoipResult } from '@features/geoip/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import type { Shading } from '@features/parameterizedShading/model/Shading.js';
import { createReducer } from '@reduxjs/toolkit';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import {
  type MapStateBase,
  mapRefocus,
  mapReplaceLayer,
  mapSetBounds,
  mapSetCountries,
  mapSetCustomLayers,
  mapSetEsriAttribution,
  mapSetLocalPrefs,
  mapSetShading,
  mapSuppressLegacyMapWarning,
  mapToggleLayer,
} from './actions.js';

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
  shading: {
    backgroundColor: [0x00, 0x00, 0x00, 0x00],
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
      if (payload.layersSettings) {
        state.layersSettings = payload.layersSettings;
      }

      if (payload.customLayers) {
        state.customLayers = payload.customLayers;
      }

      if (payload.maxZoom !== undefined) {
        state.maxZoom = payload.maxZoom;
      }
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
      const baseTypes = new Set(
        [...integratedLayerDefs, ...state.customLayers, ...state.cachedMaps]
          .filter((def) => def.layer === 'base')
          .map((def) => def.type),
      );

      const layersSet = new Set(state.layers);

      if (baseTypes.has(type) && enable !== false) {
        if (layersSet.has(type)) {
          return;
        }

        state.layers = [
          type,
          ...state.layers.filter((layer) => !baseTypes.has(layer)),
        ];
      }
      // overlay
      else {
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
      const settings = action.payload?.settings;

      if (!settings) {
        return;
      }

      state.layersSettings = settings.layersSettings ?? state.layersSettings;

      state.customLayers = settings.customLayers?.length
        ? settings.customLayers
        : state.customLayers;
    })
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
        shading: map?.shading ?? state.shading,
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
    .addCase(mapSetShading, (state, action) => {
      state.shading = action.payload;
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
      const map = state.cachedMaps.find((m) => m.type === payload.id);

      if (map) {
        map.downloadedCount = payload.downloaded;
        map.sizeBytes = payload.sizeBytes;
      }
    })
    .addCase(cacheTilesComplete, (state, { payload }) => {
      const map = state.cachedMaps.find((m) => m.type === payload.id);

      if (map) {
        map.downloadedCount = map.tileCount;
      }
    })
    .addCase(cacheTilesCancel, (state, { payload }) => {
      state.cachedMaps = state.cachedMaps.filter((m) => m.type !== payload.id);
    })
    .addCase(cachedMapDeleted, (state, { payload }) => {
      state.cachedMaps = state.cachedMaps.filter((m) => m.type !== payload.id);

      state.layers = state.layers.filter((l) => l !== payload.id);
    })
    .addCase(cachedMapRenamed, (state, { payload }) => {
      const map = state.cachedMaps.find((m) => m.type === payload.id);

      if (map) {
        map.name = payload.name;
      }
    }),
);
