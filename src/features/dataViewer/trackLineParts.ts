import type { Feature, FeatureCollection, LineString } from 'geojson';
import { trackSegmentFeatures } from './splitTrack.js';
import { type TrackLine, trackLineFeatures } from './trackSelection.js';

const isLine = (feature: Feature): feature is Feature<LineString> =>
  feature.geometry.type === 'LineString';

/**
 * The collection's lines as single-`LineString` features, one per segment,
 * each with the path-detail spans and the per-point channels cut to it — a
 * colorizer reads both against its own feature's coordinates.
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
