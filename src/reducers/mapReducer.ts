import { createReducer } from '@reduxjs/toolkit';
import { authSetUser } from '../actions/authActions.js';
import { gallerySetFilter } from '../actions/galleryActions.js';
import { applySettings, Selection } from '../actions/mainActions.js';
import {
  mapRefocus,
  mapSetCustomLayers,
  mapSetEsriAttribution,
  mapSetShading,
  MapStateBase,
  mapSuppressLegacyMapWarning,
} from '../actions/mapActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';
import { Shading } from '../components/parameterizedShading/Shading.js';

export interface MapState extends MapStateBase {
  selection: Selection | null;
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
  legacyMapWarningSuppressions: string[];
  tempLegacyMapWarningSuppressions: string[];
  esriAttribution: string[];
  shading: Shading;
}

export const mapInitialState: MapState = {
  layers: ['X'],
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  layersSettings: {},
  selection: null,
  removeGalleryOverlayOnGalleryToolQuit: false,
  gpsTracked: false,
  customLayers: [],
  legacyMapWarningSuppressions: [],
  tempLegacyMapWarningSuppressions: [],
  esriAttribution: [],
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
    .addCase(applySettings, (state, action) => {
      if (action.payload.layersSettings) {
        state.layersSettings = action.payload.layersSettings;
      }

      if (action.payload.customLayers) {
        state.customLayers = action.payload.customLayers;
      }
    })
    .addCase(gallerySetFilter, (state) => {
      if (!state.layers.includes('I')) {
        state.layers.push('I');
      }
    })
    .addCase(mapRefocus, (state, action) => {
      const { zoom, lat, lon, layers } = action.payload;

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
        action.payload.gpsTracked !== undefined ||
        (lat !== undefined && lon !== undefined)
      ) {
        state.gpsTracked = !!action.payload.gpsTracked;
      }
    })
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
    .addCase(mapSetShading, (state, action) => {
      state.shading = action.payload;
    }),
);
