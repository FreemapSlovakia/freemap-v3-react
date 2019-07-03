import { createStandardAction, createAction } from 'typesafe-actions';

export const mapReset = createAction('MAP_RESET');

// TODO
// let sn = []; // HACK safety net to prevent endless loop in case of some error

// export function mapRefocus(changes) {
//   const now = Date.now();
//   sn = sn.filter(time => now - time < 1000);
//   sn.push(now);
//   if (sn.length > 10) {
//     throw new Error('endless loop detected');
//   }

//   return { type: at.MAP_REFOCUS, payload: { ...changes } };
// }

export interface IMapViewState {
  mapType: string;
  lat: number;
  lon: number;
  zoom: number;
  overlays: string[];
}

export interface IMapStateBase extends IMapViewState {
  overlayOpacity: { [type: string]: number };
  overlayPaneOpacity: number;
  tileFormat: 'jpeg' | 'png';
}

export const mapRefocus = createStandardAction('MAP_REFOCUS')<
  Partial<IMapViewState>
>();

export const mapSetTileFormat = createStandardAction('MAP_SET_TILE_FORMAT')<
  'png' | 'jpeg'
>();

export const mapSetOverlayOpacity = createStandardAction(
  'MAP_SET_OVERLAY_OPACITY',
)<{ [key: string]: number }>();

export const mapSetOverlayPaneOpacity = createStandardAction(
  'MAP_SET_OVERLAY_PANE_OPACITY',
)<number>();

export const mapLoadState = createStandardAction('MAP_LOAD_STATE')<
  IMapStateBase
>();

export const mapSetStravaAuth = createStandardAction('MAP_SET_STRAVA_AUTH')<
  boolean
>();
