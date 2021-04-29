import { BaseLayerLetters, OverlayLetters } from 'fm3/mapDefinitions';
import { createAction } from 'typesafe-actions';

export interface MapViewState {
  mapType: BaseLayerLetters;
  lat: number;
  lon: number;
  zoom: number;
  overlays: OverlayLetters[];
}

export interface MapStateBase extends MapViewState {
  overlayOpacity: { [type: string]: number };
  overlayPaneOpacity: number;
}

export const mapRefocus = createAction('MAP_REFOCUS')<
  Partial<MapViewState> & { gpsTracked?: boolean }
>();

export const mapSetOverlayOpacity = createAction('MAP_SET_OVERLAY_OPACITY')<{
  [key: string]: number;
}>();

export const mapSetOverlayPaneOpacity = createAction(
  'MAP_SET_OVERLAY_PANE_OPACITY',
)<number>();

export const mapSetLeafletReady = createAction('MAP_LEAFLET_READY')<boolean>();
