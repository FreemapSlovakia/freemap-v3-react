import { Geometry } from 'geojson';

export interface NominatimResult {
  osm_id?: number;
  osm_type?: 'node' | 'way' | 'relation';
  geojson?: Geometry;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  class: string;
  type: string;
  extratags?: null | Record<string, string>;
  boundingbox?: [string, string, string, string];
}
