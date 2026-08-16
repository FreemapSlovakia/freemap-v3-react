import {
  type OsmFeatureId,
  syntheticFeatureId,
} from '@shared/types/featureId.js';
import {
  type PhotonFeature,
  photonAddress,
  photonDisplayName,
  photonExtentToBBox,
  photonOsmElementType,
  photonOsmTags,
} from '@shared/types/photonResult.js';
import { feature } from '@turf/helpers';
import type { Point } from 'geojson';
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
 * A geocoder hit as a result holds one.
 *
 * The hit is `incomplete`: Photon answers with a centroid and the tag it was
 * indexed under, and the outline — with the rest of the tags — arrives from OSM
 * when the result is selected.
 */
export function photonToSearchResult(
  { geometry, properties }: PhotonFeature,
  source: 'nominatim-forward' | 'nominatim-reverse',
): SearchResult {
  return {
    source,
    id:
      properties.osm_type !== undefined && properties.osm_id !== undefined
        ? {
            type: 'osm',
            elementType: photonOsmElementType(properties.osm_type),
            id: properties.osm_id,
          }
        : syntheticFeatureId(),
    incomplete: true,
    displayName: photonDisplayName(properties),
    // Absent rather than empty: a hit with no address at all must still fall
    // back to showing its name below, as every other source does.
    address: photonAddress(properties) || undefined,
    geojson: feature(
      geometry as Point,
      photonOsmTags(properties),
      properties.extent && { bbox: photonExtentToBBox(properties.extent) },
    ),
  };
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
