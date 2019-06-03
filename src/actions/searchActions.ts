import { createStandardAction } from 'typesafe-actions';

interface SearchResult {
  id: number;
  label: string;
  geojson: object;
  lat: number;
  lon: number;
  tags: { name: string; type: string };
}

export const searchSetQuery = createStandardAction('SEARCH_SET_QUERY')<
  string
>();

export const searchSetResults = createStandardAction('SEARCH_SET_RESULTS')<
  SearchResult[]
>();

export const searchHighlightResult = createStandardAction('')<SearchResult>();

export const searchSelectResult = createStandardAction('')<SearchResult>();
