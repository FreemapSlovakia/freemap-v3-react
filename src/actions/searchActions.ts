import { createStandardAction } from 'typesafe-actions';
import { GeoJsonObject } from 'geojson';

export interface SearchResult {
  id: number;
  label: string;
  geojson: GeoJsonObject;
  lat: number;
  lon: number;
  class?: string;
  type?: string;
}

export const searchSetQuery = createStandardAction('SEARCH_SET_QUERY')<
  string
>();

export const searchSetResults = createStandardAction('SEARCH_SET_RESULTS')<
  SearchResult[]
>();

export const searchSelectResult = createStandardAction('SEARCH_SELECT_RESULT')<
  SearchResult
>();
