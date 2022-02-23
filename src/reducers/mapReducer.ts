import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import { gallerySetFilter } from 'fm3/actions/galleryActions';
import { Selection } from 'fm3/actions/mainActions';
import {
  mapRefocus,
  mapSetLayersSettings,
  mapSetOverlayPaneOpacity,
  MapStateBase,
} from 'fm3/actions/mapActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import { createReducer } from 'typesafe-actions';

export interface MapState extends MapStateBase {
  selection: Selection | null;
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
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
};

export const mapReducer = createReducer<MapState, RootAction>(mapInitialState)
  .handleAction(mapSetLayersSettings, (state, action) => ({
    ...state,
    layersSettings: action.payload,
  }))
  .handleAction(mapSetOverlayPaneOpacity, (state, action) => ({
    ...state,
    overlayPaneOpacity: action.payload,
  }))
  .handleAction(gallerySetFilter, (state) => {
    return {
      ...state,
      overlays: state.overlays.includes('I')
        ? state.overlays
        : [...state.overlays, 'I'],
    };
  })
  .handleAction(mapRefocus, (state, action) => {
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
  .handleAction(authSetUser, (state, action) => {
    const settings = action.payload?.settings;

    return settings
      ? {
          ...state,
          layersSettings:
            settings.layersSettings === undefined
              ? state.layersSettings
              : settings.layersSettings,
          overlayPaneOpacity:
            typeof settings.overlayPaneOpacity === 'number'
              ? settings.overlayPaneOpacity
              : state.overlayPaneOpacity,
        }
      : state;
  })
  .handleAction(
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
    }),
  );
