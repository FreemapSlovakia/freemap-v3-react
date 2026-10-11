import { flattenTracks } from '@shared/flattenTracks.js';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import { readChannels, writeChannels } from './trackChannels.js';
import { type TrackLine, trackLineFeatures } from './trackSelection.js';

const isLine = (feature: Feature): feature is Feature<LineString> =>
  feature.geometry.type === 'LineString' &&
  feature.geometry.coordinates.length > 1;

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
  const channels = readChannels(feature);

  return flattenTracks(feature).flatMap((part, i) => {
    if (!isLine(part)) {
      return [];
    }

    const properties = { ...part.properties };

    // The channels of a multi-segment track are nested per segment, so each
    // part takes its own row of them.
    writeChannels(properties, channels, true, (channel) => [
      channel.segments[i] ?? [],
    ]);

    return [{ ...part, properties }];
  });
}
