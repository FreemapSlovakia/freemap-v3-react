import {
  PATH_DETAILS_PROP,
  readPathDetailsParts,
} from '@shared/colorizers/colorize.js';
import { flatten } from '@turf/flatten';
import type { Feature, FeatureCollection } from 'geojson';

/**
 * `@turf/flatten`, but each part keeps only its own entry of the path-detail
 * spans; `flatten` would copy every part's spans onto each.
 */
export function flattenTracks(geojson: Feature | FeatureCollection): Feature[] {
  const features =
    geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

  return features.flatMap((feature) =>
    withOwnPathDetails(feature, flatten(feature).features),
  );
}

/** Each part holding the one entry of the parent's spans that is its own. */
function withOwnPathDetails(feature: Feature, parts: Feature[]): Feature[] {
  // Spans index line parts only, so any other geometry keeps them whole.
  if (feature.geometry?.type !== 'MultiLineString' || parts.length < 2) {
    return parts;
  }

  const details = readPathDetailsParts(feature);

  if (!details) {
    return parts;
  }

  return parts.map((part, i) => ({
    ...part,
    properties: { ...part.properties, [PATH_DETAILS_PROP]: [details[i] ?? {}] },
  }));
}
