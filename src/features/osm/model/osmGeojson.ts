import type { OsmApiFullFeature } from '@shared/osmApi.js';
import type { Feature, Geometry } from 'geojson';

/**
 * The geometry an OSM element is drawn as, with the element's tags as its
 * `properties` — which is what lets a display name be copied onto it without
 * knowing which geometry it turned out to be.
 */
export type OsmGeojson = Feature<Geometry> & {
  properties: Record<string, string>;
};

/** The API's feature as the map draws it. Its `id` is not carried: the caller
 * already knows which element it asked for, and the search store keys results
 * by its own `FeatureId`. */
export function toOsmGeojson(feature: OsmApiFullFeature): OsmGeojson {
  return {
    type: 'Feature',
    bbox: feature.bbox,
    geometry: feature.geometry,
    properties: feature.properties,
  };
}
