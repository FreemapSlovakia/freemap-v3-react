import type { SearchResult } from '@features/search/model/actions.js';
import { point } from '@turf/helpers';
import type { ObjectsResult } from './actions.js';

/**
 * An object as a result, so one set of actions and one details panel serve a
 * lookup and an object alike.
 *
 * The geometry is the point the marker sits at, so what is behind it is fetched
 * when it is looked at and not before — a screenful would otherwise be hundreds
 * of ways and relations resolved down to their nodes for nothing. A result that
 * outlives the selection is marked `incomplete` by its caller so that fetch can
 * still happen.
 */
export function objectToSearchResult(object: ObjectsResult): SearchResult {
  return {
    source: 'osm',
    id: object.id,
    geojson: point([object.coords.lon, object.coords.lat], object.tags),
  };
}
