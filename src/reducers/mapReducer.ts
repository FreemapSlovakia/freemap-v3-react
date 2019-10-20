import { createReducer } from 'typesafe-actions';
import {
  MapStateBase,
  mapRefocus,
  mapReset,
  mapSetTileFormat,
  mapSetOverlayOpacity,
  mapSetOverlayPaneOpacity,
  mapSetStravaAuth,
} from 'fm3/actions/mapActions';
import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import { setTool, setAppState } from 'fm3/actions/mainActions';

export interface MapState extends MapStateBase {
  stravaAuth: boolean;
  tool: string | null; // TODO enum
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
}

const initialState: MapState = {
  mapType: 'X',
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: [],
  overlayOpacity: {},
  overlayPaneOpacity: 0.65,
  tileFormat: 'png',
  stravaAuth: false,
  tool: null,
  removeGalleryOverlayOnGalleryToolQuit: false,
  gpsTracked: false,
};

export const mapReducer = createReducer<MapState, RootAction>(initialState)
  .handleAction(setAppState, (state, action) => {
    return { ...state, ...action.payload.map };
  })
  .handleAction(mapReset, state => ({
    ...state,
    zoom: initialState.zoom,
    lat: initialState.lat,
    lon: initialState.lon,
    gpsTracked: false,
  }))
  .handleAction(mapSetTileFormat, (state, action) => ({
    ...state,
    tileFormat: action.payload,
  }))
  .handleAction(mapSetOverlayOpacity, (state, action) => ({
    ...state,
    overlayOpacity: action.payload,
  }))
  .handleAction(mapSetOverlayPaneOpacity, (state, action) => ({
    ...state,
    overlayPaneOpacity: action.payload,
  }))
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

    if (action.payload.gpsTracked || (lat !== undefined && lon !== undefined)) {
      newState.gpsTracked = !!action.payload.gpsTracked;
    }

    return newState;
  })
  .handleAction(authSetUser, (state, action) => {
    const settings = action.payload && action.payload.settings;
    return settings
      ? {
          ...state,
          tileFormat: settings.tileFormat || state.tileFormat,
          overlayOpacity:
            settings.overlayOpacity === undefined
              ? state.overlayOpacity
              : settings.overlayOpacity,
          overlayPaneOpacity:
            typeof settings.overlayPaneOpacity === 'number'
              ? settings.overlayPaneOpacity
              : state.overlayPaneOpacity,
        }
      : state;
  })
  .handleAction(mapSetStravaAuth, (state, action) => ({
    ...state,
    stravaAuth: action.payload,
  }))
  .handleAction(setTool, (state, action) => {
    const currentTool = state.tool;
    const nextTool = action.payload;
    let overlays = [...state.overlays];
    let removeGalleryOverlayOnGalleryToolQuit = false;
    if (nextTool === 'gallery' && !overlays.includes('I')) {
      overlays.push('I');
      removeGalleryOverlayOnGalleryToolQuit = true;
    } else if (
      currentTool === 'gallery' &&
      nextTool !== 'gallery' &&
      state.removeGalleryOverlayOnGalleryToolQuit
    ) {
      overlays = overlays.filter(o => o !== 'I');
    }
    return {
      ...state,
      overlays,
      tool: nextTool,
      removeGalleryOverlayOnGalleryToolQuit,
    };
  });
