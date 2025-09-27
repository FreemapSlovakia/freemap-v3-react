import { createAction } from '@reduxjs/toolkit';
import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';
import { FeatureId } from '../types/featureId.js';

export type SearchSource =
  | 'bbox'
  | 'geojson'
  | 'tile'
  | 'coords'
  | 'overpass-nearby'
  | 'overpass-surrounding'
  | 'overpass-objects'
  | 'nominatim-forward'
  | 'nominatim-reverse'
  | 'osm'
  | `wms:${string}`;

export interface SearchResult {
  source: SearchSource;
  geojson: Feature | (FeatureCollection & { properties: GeoJsonProperties });
  id: FeatureId;
  incomplete?: true;
  showToast?: true;
  zoom?: number;
  displayName?: string;
  genericName?: string;
}

export const searchSetQuery = createAction<{
  query: string;
  fromUrl?: boolean;
}>('SEARCH_SET_QUERY');

export const searchSetResults =
  createAction<SearchResult[]>('SEARCH_SET_RESULTS');

export const searchClear = createAction('SEARCH_CLEAR');

export const searchSelectResult = createAction<{
  result: SearchResult;
  showToast?: boolean;
  focus?: boolean;
  storeResult?: boolean;
  // TODO refactor to: actions?: ('showToast' | 'focus' | 'storeResult')[];
} | null>('SEARCH_SELECT_RESULT');
