import { BaseLayerLetters, LayerDef, OverlayLetters } from 'fm3/mapDefinitions';
import { createAction } from 'typesafe-actions';

export interface MapViewState {
  mapType: BaseLayerLetters;
  lat: number;
  lon: number;
  zoom: number;
  overlays: OverlayLetters[];
}

export type LayerSettings = {
  opacity?: number;
  showInMenu?: boolean;
  showInToolbar?: boolean;
};

export type CustomMap = Pick<
  LayerDef,
  | 'url'
  | 'minZoom'
  | 'minNativeZoom'
  | 'maxNativeZoom'
  | 'zIndex'
  | 'subdomains'
  | 'tms'
  | 'extraScales'
  | 'tileSize'
  | 'zoomOffset'
  | 'cors'
> & { type: `.${number}` | `:${number}`; url: string };

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  overlayPaneOpacity: number;
  customLayers: CustomMap[]; // URL is mandatory here
}

export const mapRefocus = createAction('MAP_REFOCUS')<
  Partial<MapViewState> & { gpsTracked?: boolean }
>();

export const mapSetLayersSettings = createAction('MAP_SET_LAYERS_SETTINGS')<
  Record<string, LayerSettings>
>();

export const mapSetOverlayPaneOpacity = createAction(
  'MAP_SET_OVERLAY_PANE_OPACITY',
)<number>();

export const mapSetCustomLayers = createAction('MAP_SET_CUSTOM_LAYERS')<
  CustomMap[]
>();
