import {
  PATH_DETAILS_PROP,
  readPathDetailsParts,
} from '@shared/colorizers/colorize.js';
import { flatten } from '@turf/flatten';
import { featureCollection } from '@turf/helpers';
import type { Feature, FeatureCollection } from 'geojson';

/**
 * Every part of each feature as a feature of its own, the way
 * `@turf/flatten` splits it but with the path-detail spans of the part kept to
 * the part. `flatten` copies the whole of `properties` onto every part, so
 * without this each part of a multi-segment track would carry the spans meant
 * for all of them — which line up with no part's coordinates, and read as no
 * data at all.
 */
export function flattenTracks(geojson: Feature | FeatureCollection): Feature[] {
  const features =
    geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

  const parts = flatten(featureCollection(features)).features;

  let at = 0;

  return features.flatMap((feature) => {
    const own = parts.slice(at, at + partCount(feature));

    at += own.length;

    return withOwnPathDetails(feature, own);
  });
}

/** How many features `flatten` gives this one: one per geometry part. */
function partCount(feature: Feature): number {
  const { geometry } = feature;

  if (!geometry) {
    return 0;
  }

  switch (geometry.type) {
    case 'GeometryCollection':
      return geometry.geometries.length;
    case 'MultiPoint':
    case 'MultiLineString':
    case 'MultiPolygon':
      return geometry.coordinates.length;
    default:
      return 1;
  }
}

/** Each part holding the one entry of the parent's spans that is its own. */
function withOwnPathDetails(feature: Feature, parts: Feature[]): Feature[] {
  const details = readPathDetailsParts(feature);

  if (!details || parts.length < 2) {
    return parts;
  }

  return parts.map((part, i) => ({
    ...part,
    properties: { ...part.properties, [PATH_DETAILS_PROP]: [details[i] ?? {}] },
  }));
}
