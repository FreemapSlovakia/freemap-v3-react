import type { OsmFeatureId } from '@shared/types/featureId.js';
import { feature } from '@turf/helpers';
import type { SearchResult } from './actions.js';

/**
 * Whether the result carries geometry to work with. A result without any is
 * either an OSM element still being fetched (see `loadingResult`) or a
 * geocoding hit that came without an outline — neither can be drawn, exported,
 * or read an elevation at.
 */
export function hasGeometry(result: SearchResult): boolean {
  return (
    result.geojson.type === 'FeatureCollection' ||
    result.geojson.geometry !== null
  );
}

/**
 * A stand-in for an OSM element whose fetch is in flight, held among the shown
 * results so the element is in the URL — and off the list of loads still to
 * start — from the moment it is asked for rather than once it arrives.
 */
export function loadingResult(id: OsmFeatureId): SearchResult {
  return {
    source: 'osm',
    id,
    incomplete: true,
    loading: true,
    geojson: feature(null, {}),
  };
}
