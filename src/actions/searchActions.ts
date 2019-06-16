import { createStandardAction } from 'typesafe-actions';

export interface SearchResult {
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

export const searchHighlightResult = createStandardAction(
  'SEARCH_HIGHLIGHT_RESULT',
)<SearchResult>();

export const searchSelectResult = createStandardAction('SEARCH_SELECT_RESULT')<
  SearchResult
>();
