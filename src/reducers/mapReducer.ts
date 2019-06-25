import { createReducer } from 'typesafe-actions';
import {
  mapLoadState,
  IMapStateBase,
  mapRefocus,
  mapReset,
  mapSetTileFormat,
  mapSetOverlayOpacity,
  mapSetOverlayPaneOpacity,
  mapSetStravaAuth,
} from 'fm3/actions/mapActions';
import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import { setTool } from 'fm3/actions/mainActions';

export interface IMapState extends IMapStateBase {
  stravaAuth: boolean;
  tool: string | null; // TODO enum
  removeGalleryOverlayOnGalleryToolQuit: boolean;
}

const initialState: IMapState = {
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
};

export const mapReducer = createReducer<IMapState, RootAction>(initialState)
  .handleAction(mapLoadState, (state, action) => {
    // TODO improve validation

    const s = { ...state };
    const {
      mapType,
      lat,
      lon,
      zoom,
      overlays,
      overlayOpacity,
      tileFormat,
      overlayPaneOpacity,
    } = action.payload;
    if (mapType) {
      s.mapType = mapType;
    }
    if (typeof lat === 'number') {
      s.lat = lat;
    }
    if (typeof lon === 'number') {
      s.lon = lon;
    }
    if (typeof zoom === 'number') {
      s.zoom = zoom;
    }
    if (Array.isArray(overlays)) {
      s.overlays = [...overlays];
    }
    if (overlayOpacity) {
      s.overlayOpacity = {
        ...initialState.overlayOpacity,
        ...overlayOpacity,
      };
    }
    if (overlayPaneOpacity) {
      s.overlayPaneOpacity = overlayPaneOpacity;
    }
    if (tileFormat) {
      s.tileFormat = tileFormat;
    }
    return s;
  })
  .handleAction(mapReset, state => ({
    ...state,
    zoom: initialState.zoom,
    lat: initialState.lat,
    lon: initialState.lon,
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
    const newState: IMapState = { ...state };
    const { zoom, lat, lon, mapType, overlays } = action.payload;

    if (zoom) {
      newState.zoom = zoom;
    }
    if (lat) {
      newState.lat = lat;
    }
    if (lon) {
      newState.lon = lon;
    }
    if (mapType) {
      newState.mapType = mapType;
    }
    if (overlays) {
      newState.overlays = overlays;
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
