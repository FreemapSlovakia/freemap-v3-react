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
 *
 * A map document can't store one, having no geometry to store, so a save made
 * while the fetch is in flight leaves that pin out of the document while the URL
 * goes on naming it: it comes back on the next online open, exactly as the map
 * that was saved before pins were stored does. `savedRouteFromState` leaves a
 * route in flight out for the same reason.
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
