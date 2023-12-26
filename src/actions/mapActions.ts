import {
  BaseLayerLetters,
  LayerDef,
  Num1digit,
  OverlayLetters,
} from 'fm3/mapDefinitions';
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

export type CustomLayer = Pick<
  LayerDef,
  | 'url'
  | 'minZoom'
  | 'maxNativeZoom'
  | 'zIndex'
  | 'subdomains'
  | 'tms'
  | 'extraScales'
  | 'scaleWithDpi'
  | 'cors'
> & { type: `.${Num1digit}` | `:${Num1digit}`; url: string };

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  overlayPaneOpacity: number;
  customLayers: CustomLayer[]; // URL is mandatory here
}

export const mapRefocus = createAction('MAP_REFOCUS')<
  Partial<MapViewState> & { gpsTracked?: boolean }
>();

export const mapSuppressLegacyMapWarning = createAction(
  'MAP_SUPPRESS_LEGACY_MAP_WARING',
)<{ forever: boolean }>();

export const mapSetCustomLayers = createAction('MAP_SET_CUSTOM_LAYERS')<
  CustomLayer[]
>();

export const mapSetEsriAttribution = createAction('MAP_SET_ESRI_ATTRIBUTION')<
  string[]
>();
