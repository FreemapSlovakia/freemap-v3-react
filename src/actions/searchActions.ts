import { createAction } from 'typesafe-actions';
import { GeoJsonObject } from 'geojson';

export interface SearchResult {
  id: number;
  label: string;
  geojson: GeoJsonObject;
  lat: number;
  lon: number;
  class?: string;
  type?: string;
  osmType?: string;
}

export const searchSetQuery = createAction('SEARCH_SET_QUERY')<{
  query: string;
  fromUrl?: boolean;
}>();

export const searchSetResults = createAction('SEARCH_SET_RESULTS')<
  SearchResult[]
>();

export const searchSelectResult = createAction(
  'SEARCH_SELECT_RESULT',
)<SearchResult | null>();
