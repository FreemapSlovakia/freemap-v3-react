import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import { selectFeature, Selection, setAppState } from 'fm3/actions/mainActions';
import {
  mapRefocus,
  mapSetOverlayOpacity,
  mapSetOverlayPaneOpacity,
  MapStateBase,
} from 'fm3/actions/mapActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import { createReducer } from 'typesafe-actions';

export interface MapState extends MapStateBase {
  selection: Selection | null;
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
  overlayPaneOpacity: 0.75,
  selection: null,
  removeGalleryOverlayOnGalleryToolQuit: false,
  gpsTracked: false,
};

export const mapReducer = createReducer<MapState, RootAction>(initialState)
  .handleAction(setAppState, (state, action) => {
    return { ...state, ...action.payload.map };
  })
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

    if (
      action.payload.gpsTracked !== undefined ||
      (lat !== undefined && lon !== undefined)
    ) {
      newState.gpsTracked = !!action.payload.gpsTracked;
    }

    return newState;
  })
  .handleAction(authSetUser, (state, action) => {
    const settings = action.payload && action.payload.settings;
    return settings
      ? {
          ...state,
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
  .handleAction(selectFeature, (state, action) => {
    const currentSelection = state.selection;
    const nextSelection = action.payload;
    let overlays = [...state.overlays];
    let removeGalleryOverlayOnGalleryToolQuit = false;

    if (nextSelection?.type === 'photos' && !overlays.includes('I')) {
      overlays.push('I');
      removeGalleryOverlayOnGalleryToolQuit = true;
    } else if (
      currentSelection?.type === 'photos' &&
      nextSelection?.type !== 'photos' &&
      state.removeGalleryOverlayOnGalleryToolQuit
    ) {
      overlays = overlays.filter((o) => o !== 'I');
    }

    return {
      ...state,
      overlays,
      selection: nextSelection,
      removeGalleryOverlayOnGalleryToolQuit,
    };
  })
  .handleAction(mapsDataLoaded, (state, { payload: { map } }) => ({
    ...state,
    lat: map?.lat ?? state.lat,
    lon: map?.lon ?? state.lon,
    zoom: map?.zoom ?? state.zoom,
    mapType: map?.mapType ?? state.mapType,
    overlays: map?.overlays ?? state.overlays,
  }));
