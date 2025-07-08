import { createAction } from '@reduxjs/toolkit';
import { Shading } from '../components/parameterizedShading/Shading.js';
import {
  BaseLayerLetters,
  CustomLayerDef,
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

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  customLayers: CustomLayerDef[];
}

export const mapRefocus = createAction<
  Partial<MapViewState> & { gpsTracked?: boolean }
>('MAP_REFOCUS');

export const mapSuppressLegacyMapWarning = createAction<{ forever: boolean }>(
  'MAP_SUPPRESS_LEGACY_MAP_WARING',
);

export const mapSetCustomLayers = createAction<CustomLayerDef[]>(
  'MAP_SET_CUSTOM_LAYERS',
);

export const mapSetEsriAttribution = createAction<string[]>(
  'MAP_SET_ESRI_ATTRIBUTION',
);

export const mapSetShading = createAction<Shading>('MAP_SET_SHADING');
