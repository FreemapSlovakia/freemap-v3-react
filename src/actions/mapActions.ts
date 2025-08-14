import { createAction } from '@reduxjs/toolkit';
import { Shading } from '../components/parameterizedShading/Shading.js';
import { CustomLayerDef } from '../mapDefinitions.js';
import { Shortcut } from '../types/common.js';

export interface MapViewState {
  lat: number;
  lon: number;
  zoom: number;
  layers: string[];
  bounds?: [number, number, number, number];
  countries?: string[];
}

export type LayerSettings = {
  opacity?: number;
  showInMenu?: boolean;
  showInToolbar?: boolean;
  shortcut?: Shortcut | null;
};

export interface MapStateBase extends MapViewState {
  layersSettings: Record<string, LayerSettings>;
  customLayers: CustomLayerDef[];
}

export const mapRefocus = createAction<
  Partial<MapViewState> & { gpsTracked?: boolean }
>('MAP_REFOCUS');

export const mapReplaceLayer = createAction<{ from: string; to: string }>(
  'MAP_REPLACE_LAYER',
);

export const mapToggleLayer = createAction<{ type: string; enable?: boolean }>(
  'MAP_TOGGLE_LAYER',
);

export const mapSuppressLegacyMapWarning = createAction<{
  type: string;
  forever: boolean;
}>('MAP_SUPPRESS_LEGACY_MAP_WARING');

export const mapSetCustomLayers = createAction<CustomLayerDef[]>(
  'MAP_SET_CUSTOM_LAYERS',
);

export const mapSetEsriAttribution = createAction<string[]>(
  'MAP_SET_ESRI_ATTRIBUTION',
);

export const mapSetShading = createAction<Shading>('MAP_SET_SHADING');

export const mapSetBounds =
  createAction<[number, number, number, number]>('MAP_SET_BOUNDS');

export const mapSetCountries = createAction<string[] | undefined>(
  'MAP_SET_COUNTRIES',
);
