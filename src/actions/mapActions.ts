import { createAction } from '@reduxjs/toolkit';
import {
  BaseLayerLetters,
  LayerDef,
  Num1digit,
  OverlayLetters,
} from 'fm3/mapDefinitions';

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

export const mapRefocus = createAction<
  Partial<MapViewState> & { gpsTracked?: boolean }
>('MAP_REFOCUS');

export const mapSuppressLegacyMapWarning = createAction<{ forever: boolean }>(
  'MAP_SUPPRESS_LEGACY_MAP_WARING',
);

export const mapSetCustomLayers = createAction<CustomLayer[]>(
  'MAP_SET_CUSTOM_LAYERS',
);

export const mapSetEsriAttribution = createAction<string[]>(
  'MAP_SET_ESRI_ATTRIBUTION',
);
