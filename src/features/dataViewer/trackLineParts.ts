import type { Feature, FeatureCollection, LineString } from 'geojson';
import { trackSegmentFeatures } from './splitTrack.js';
import { type TrackLine, trackLineFeatures } from './trackSelection.js';

const isLine = (feature: Feature): feature is Feature<LineString> =>
  feature.geometry.type === 'LineString';

/**
 * The collection's lines as single-`LineString` features, one per segment. The
 * split has to take the per-point channels and the path-detail spans with it:
 * `@turf/flatten` copies the whole of `properties` onto every part, leaving a
 * nested `coordinateProperties` that lines up with no part's coordinates, which
 * a colorizer reads as no data at all.
 */
export function trackLineParts(
  fc: FeatureCollection | null | undefined,
): Feature<LineString>[] {
  return trackLineFeatures(fc).flatMap(({ feature }) => lineParts(feature));
}

/** The same for one track feature, for a reader that has already picked it. */
export function lineParts(feature: TrackLine): Feature<LineString>[] {
  return isLine(feature)
    ? [feature]
    : trackSegmentFeatures(feature).filter(isLine);
}
