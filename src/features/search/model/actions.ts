import {
  type DrawingStyle,
  DrawingStyleSchema,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createAction } from '@reduxjs/toolkit';
import type { FeatureId } from '@shared/types/featureId.js';
import type { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';

/**
 * User-overridable style for displayed search / map-details geometry. Shares
 * the full drawing-style shape (color, fill, width, dash, line cap/join, marker
 * shape); `color` and `fillColor` are RGBA hex (their alpha is the opacity).
 * Used by the `search` and `mapDetails` features, which render through the same
 * component.
 */
export const SearchResultStyleSchema = DrawingStyleSchema;

export type SearchResultStyle = DrawingStyle;

export const searchSetResultStyle = createAction<SearchResultStyle>(
  'SEARCH_SET_RESULT_STYLE',
);

export type SearchSource =
  | 'bbox'
  | 'geojson'
  | 'tile'
  | 'coords'
  | 'overpass-nearby'
  | 'overpass-surrounding'
  | 'nominatim-forward'
  | 'nominatim-reverse'
  | 'osm'
  | `wms:${string}`;

export interface SearchResult {
  source: SearchSource;
  geojson: Feature | (FeatureCollection & { properties: GeoJsonProperties });
  id: FeatureId;
  incomplete?: true;
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
} | null>('SEARCH_SELECT_RESULT');
