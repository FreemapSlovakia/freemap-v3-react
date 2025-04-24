import { createAction } from '@reduxjs/toolkit';
import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';

export interface SearchResult {
  id: number;
  geojson?: Feature | FeatureCollection;
  osmType: 'node' | 'way' | 'relation';
  tags: GeoJsonProperties;
  detailed?: true;
  showToast?: true;
  zoom?: number;
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
