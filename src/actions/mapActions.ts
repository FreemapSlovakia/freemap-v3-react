import { createAction } from '@reduxjs/toolkit';
import { Shading } from 'components/parameterizedShading/Shading.js';
import {
  BaseLayerDef,
  BaseLayerLetters,
  LayerDef,
  OverlayLayerDef,
  OverlayLetters,
} from '../mapDefinitions.js';

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

type CustomLayerBase = Pick<
  LayerDef,
  | 'url'
  | 'minZoom'
  | 'maxNativeZoom'
  | 'subdomains'
  | 'tms'
  | 'extraScales'
  | 'scaleWithDpi'
  | 'cors'
>;

export type CustomBaseLayer = CustomLayerBase & Pick<BaseLayerDef, 'type'>;

export type CustomOverlayLayer = CustomLayerBase &
  Pick<OverlayLayerDef, 'type' | 'zIndex'>;

export type CustomLayer = CustomBaseLayer | CustomOverlayLayer;

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  overlayPaneOpacity: number;
  customLayers: (CustomBaseLayer | CustomOverlayLayer)[]; // URL is mandatory here
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

export const mapSetShading = createAction<Shading>('MAP_SET_SHADING');
