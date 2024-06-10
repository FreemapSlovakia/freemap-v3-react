import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';
import { createAction } from 'typesafe-actions';

export interface SearchResult {
  id: number;
  geojson?: Feature | FeatureCollection;
  osmType: 'node' | 'way' | 'relation';
  tags: GeoJsonProperties;
  detailed?: true;
  showToast?: true;
  zoom?: number;
}

export const searchSetQuery = createAction('SEARCH_SET_QUERY')<{
  query: string;
  fromUrl?: boolean;
}>();

export const searchSetResults =
  createAction('SEARCH_SET_RESULTS')<SearchResult[]>();

export const searchSelectResult = createAction('SEARCH_SELECT_RESULT')<{
  result: SearchResult;
  showToast?: boolean;
  focus?: boolean;
  storeResult?: boolean;
  // TODO refactor to: actions?: ('showToast' | 'focus' | 'storeResult')[];
} | null>();
