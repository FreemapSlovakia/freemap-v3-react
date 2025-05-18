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
  mapType: 'X',
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: [],
  layersSettings: {},
  overlayPaneOpacity: 0.75,
  selection: null,
  removeGalleryOverlayOnGalleryToolQuit: false,
  gpsTracked: false,
  customLayers: [],
  legacyMapWarningSuppressions: [],
  tempLegacyMapWarningSuppressions: [],
  esriAttribution: [],
  shading: {
    backgroundColor: [0x00, 0x00, 0x00, 0xff],
    components: [
      {
        id: 1,
        type: 'hillshade-classic',
        elevation: 45 * (Math.PI / 180),
        azimuth: 315 * (Math.PI / 180),
        brightness: 0,
        contrast: 1,
        color: [0xff, 0xff, 0xff, 0xff],
        weight: 1,
      },
      // {
      //   id: 1,
      //   type: 'hillshade-igor',
      //   elevation: 0,
      //   azimuth: (135 / 180) * Math.PI,
      //   brightness: 0,
      //   contrast: 1,
      //   color: [0x50, 0x60, 0xff, 0x60],
      //   weight: 1,
      // },
      // {
      //   id: 2,
      //   type: 'hillshade-igor',
      //   elevation: 0,
      //   azimuth: (315 / 180) * Math.PI,
      //   brightness: 0,
      //   contrast: 1,
      //   color: [0xe0, 0xd0, 0x00, 0xb0],
      //   weight: 1,
      // },
      // {
      //   id: 3,
      //   type: 'hillshade-igor',
      //   elevation: 0,
      //   azimuth: (135 / 180) * Math.PI,
      //   brightness: 0,
      //   contrast: 1,
      //   color: [0x00, 0x00, 0x00, 0x80],
      //   weight: 1,
      // },
      // {
      //   id: 4,
      //   type: 'slope-igor',
      //   elevation: 0,
      //   azimuth: 0,
      //   brightness: 0,
      //   contrast: 1,
      //   color: [0x00, 0x00, 0x00, 0xff],
      //   weight: 1,
      // },
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
      ].push(state.mapType);
    })
    .addCase(applySettings, (state, action) => {
      if (action.payload.layersSettings) {
        state.layersSettings = action.payload.layersSettings;
      }

      if (action.payload.overlayPaneOpacity) {
        state.overlayPaneOpacity = action.payload.overlayPaneOpacity;
      }

      if (action.payload.customLayers) {
        state.customLayers = action.payload.customLayers;
      }
    })
    .addCase(gallerySetFilter, (state) => {
      if (!state.overlays.includes('I')) {
        state.overlays.push('I');
      }
    })
    .addCase(mapRefocus, (state, action) => {
      const { zoom, lat, lon, mapType, overlays } = action.payload;

      if (zoom) {
        state.zoom = zoom;
      }

      if (lat !== undefined) {
        state.lat = lat;
      }

      if (lon !== undefined) {
        state.lon = lon;
      }

      if (mapType) {
        state.mapType = mapType;
      }

      if (overlays) {
        state.overlays = overlays;
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

      state.overlayPaneOpacity =
        settings.overlayPaneOpacity ?? state.overlayPaneOpacity;

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
        mapType: map?.mapType ?? state.mapType,
        overlays: map?.overlays ?? state.overlays,
        customLayers: map?.customLayers ?? state.customLayers,
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
