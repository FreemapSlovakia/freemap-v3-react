import { createReducer } from '@reduxjs/toolkit';
import { authSetUser } from 'fm3/actions/authActions';
import { gallerySetFilter } from 'fm3/actions/galleryActions';
import { applySettings, Selection } from 'fm3/actions/mainActions';
import {
  mapRefocus,
  mapSetCustomLayers,
  mapSetEsriAttribution,
  MapStateBase,
  mapSuppressLegacyMapWarning,
} from 'fm3/actions/mapActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';

export interface MapState extends MapStateBase {
  selection: Selection | null;
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
  legacyMapWarningSuppressions: string[];
  tempLegacyMapWarningSuppressions: string[];
  esriAttribution: string[];
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
};

export const mapReducer = createReducer(mapInitialState, (builder) =>
  builder
    .addCase(mapSuppressLegacyMapWarning, (state, action) => {
      const key = action.payload.forever
        ? 'legacyMapWarningSuppressions'
        : 'tempLegacyMapWarningSuppressions';

      return {
        ...state,
        [key]: [...state[key], state.mapType],
      };
    })
    .addCase(applySettings, (state, action) => {
      const newState = { ...state };

      if (action.payload.layersSettings) {
        newState.layersSettings = action.payload.layersSettings;
      }

      if (action.payload.overlayPaneOpacity) {
        newState.overlayPaneOpacity = action.payload.overlayPaneOpacity;
      }

      if (action.payload.customLayers) {
        newState.customLayers = action.payload.customLayers;
      }

      return newState;
    })
    .addCase(gallerySetFilter, (state) => {
      return {
        ...state,
        overlays: state.overlays.includes('I')
          ? state.overlays
          : [...state.overlays, 'I'],
      };
    })
    .addCase(mapRefocus, (state, action) => {
      const newState: MapState = { ...state };

      const { zoom, lat, lon, mapType, overlays } = action.payload;

      if (zoom) {
        newState.zoom = zoom;
      }

      if (lat !== undefined) {
        newState.lat = lat;
      }

      if (lon !== undefined) {
        newState.lon = lon;
      }

      if (mapType) {
        newState.mapType = mapType;
      }

      if (overlays) {
        newState.overlays = overlays;
      }

      if (
        action.payload.gpsTracked !== undefined ||
        (lat !== undefined && lon !== undefined)
      ) {
        newState.gpsTracked = !!action.payload.gpsTracked;
      }

      return newState;
    })
    .addCase(authSetUser, (state, action) => {
      const settings = action.payload?.settings;

      return settings
        ? {
            ...state,
            layersSettings: settings.layersSettings ?? state.layersSettings,
            overlayPaneOpacity:
              settings.overlayPaneOpacity ?? state.overlayPaneOpacity,
            customLayers: settings.customLayers?.length
              ? settings.customLayers
              : state.customLayers,
          }
        : state;
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
    .addCase(mapSetCustomLayers, (state, action) => ({
      ...state,
      customLayers: action.payload,
    }))
    .addCase(mapSetEsriAttribution, (state, action) => ({
      ...state,
      esriAttribution: action.payload,
    })),
);
