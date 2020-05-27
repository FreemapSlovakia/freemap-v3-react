import { createAction } from 'typesafe-actions';

export interface MapViewState {
  mapType: string;
  lat: number;
  lon: number;
  zoom: number;
  overlays: string[];
}

export interface MapStateBase extends MapViewState {
  overlayOpacity: { [type: string]: number };
  overlayPaneOpacity: number;
}

export const mapReset = createAction('MAP_RESET')();

export const mapRefocus = createAction('MAP_REFOCUS')<
  Partial<MapViewState> & { gpsTracked?: boolean }
>();

export const mapSetOverlayOpacity = createAction('MAP_SET_OVERLAY_OPACITY')<{
  [key: string]: number;
}>();

export const mapSetOverlayPaneOpacity = createAction(
  'MAP_SET_OVERLAY_PANE_OPACITY',
)<number>();

export const mapSetStravaAuth = createAction('MAP_SET_STRAVA_AUTH')<boolean>();
