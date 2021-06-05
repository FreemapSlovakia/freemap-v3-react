import {
  Feature,
  FeatureCollection,
  Geometries,
  GeometryCollection,
} from '@turf/helpers';
import { createAction } from 'typesafe-actions';

export interface SearchResult {
  id: number;
  label: string;
  geojson:
    | Geometries
    | GeometryCollection
    | Feature<Geometries | GeometryCollection>
    | FeatureCollection<Geometries | GeometryCollection>;
  lat: number;
  lon: number;
  class?: string;
  type?: string;
  osmType?: 'node' | 'way' | 'relation';
  tags?: Record<string, string>;
}

export const searchSetQuery =
  createAction('SEARCH_SET_QUERY')<{
    query: string;
    fromUrl?: boolean;
  }>();

export const searchSetResults =
  createAction('SEARCH_SET_RESULTS')<SearchResult[]>();

export const searchSelectResult = createAction(
  'SEARCH_SELECT_RESULT',
)<SearchResult | null>();
