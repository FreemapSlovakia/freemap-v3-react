import {
  Feature,
  FeatureCollection,
  Geometries,
  GeometryCollection,
} from '@turf/helpers';
import { createAction } from 'typesafe-actions';

export interface SearchResult {
  id: number;
  geojson:
    | Feature<Geometries | GeometryCollection>
    | FeatureCollection<Geometries | GeometryCollection>;
  osmType: 'node' | 'way' | 'relation';
  detailed?: true;
}

export const searchSetQuery = createAction('SEARCH_SET_QUERY')<{
  query: string;
  fromUrl?: boolean;
}>();

export const searchSetResults =
  createAction('SEARCH_SET_RESULTS')<SearchResult[]>();

export const searchSelectResult = createAction(
  'SEARCH_SELECT_RESULT',
)<SearchResult | null>();
