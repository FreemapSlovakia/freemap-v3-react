import { applySettings } from '@app/store/actions.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { gallerySetFilter } from '@features/gallery/model/actions.js';
import { processGeoipResult } from '@features/geoip/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { Shading } from '@features/parameterizedShading/Shading.js';
import { createReducer } from '@reduxjs/toolkit';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import {
  MapStateBase,
  mapRefocus,
  mapReplaceLayer,
  mapSetBounds,
  mapSetCountries,
  mapSetCustomLayers,
  mapSetEsriAttribution,
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
  legacyMapWarningSuppressions: [],
  tempLegacyMapWarningSuppressions: [],
  esriAttribution: [],
  maxZoom: 20,
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
  countries: [],
};

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
        [...integratedLayerDefs, ...state.customLayers]
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
        if (zoom) {
          state.zoom = zoom;
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
        zoom: map?.zoom ?? state.zoom,
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
    .addCase(processGeoipResult, (state, { payload }) => {
      if (state.lat !== LAT || state.lon !== LON) {
        return;
      }

      if (payload.latitude !== undefined && payload.longitude !== undefined) {
        state.lat = payload.latitude;
        state.lon = payload.longitude;
        state.zoom = 9;
      }
    }),
);
