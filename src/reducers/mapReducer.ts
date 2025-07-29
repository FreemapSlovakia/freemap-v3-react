import { createReducer } from '@reduxjs/toolkit';
import { authSetUser } from '../actions/authActions.js';
import { gallerySetFilter } from '../actions/galleryActions.js';
import { applySettings } from '../actions/mainActions.js';
import {
  mapRefocus,
  mapReplaceLayer,
  mapSetBounds,
  mapSetCountries,
  mapSetCustomLayers,
  mapSetEsriAttribution,
  mapSetShading,
  MapStateBase,
  mapSuppressLegacyMapWarning,
  mapToggleLayer,
} from '../actions/mapActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';
import { Shading } from '../components/parameterizedShading/Shading.js';
import { integratedLayerDefs } from '../mapDefinitions.js';

export interface MapState extends MapStateBase {
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
  legacyMapWarningSuppressions: string[];
  tempLegacyMapWarningSuppressions: string[];
  esriAttribution: string[];
  maxZoom: number;
  shading: Shading;
}

export const mapInitialState: MapState = {
  layers: ['X'],
  lat: 48.70714,
  lon: 19.4995,
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
};

export const mapReducer = createReducer(mapInitialState, (builder) =>
  builder
    .addCase(mapSuppressLegacyMapWarning, (state, action) => {
      state[
        action.payload.forever
          ? 'legacyMapWarningSuppressions'
          : 'tempLegacyMapWarningSuppressions'
      ].push(action.type);
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
          state.gpsTracked = !!gpsTracked;
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
    }),
);
