import type { Feature, FeatureCollection } from 'geojson';
import {
  asRecord,
  COORD_PROPERTIES,
  COORD_TIMES,
  TIMES,
} from './trackChannels.js';
import { isTrackLine, type TrackLine } from './trackSelection.js';

/**
 * Whether OSM's GPS trace import keeps anything of the feature: it reads only
 * `<trkpt>`s, and of those only the ones with a time.
 */
export function isOsmTraceLine(feature: Feature): feature is TrackLine {
  if (!isTrackLine(feature) || feature.properties?.['_gpxType'] === 'rte') {
    return false;
  }

  // Only the times, read raw: `readChannels` would copy every channel.
  const props = feature.properties;

  const times =
    asRecord(props?.[COORD_PROPERTIES])?.[TIMES] ?? props?.[COORD_TIMES];

  // Flat for a LineString, one array per segment for a MultiLineString.
  return (
    Array.isArray(times) &&
    times.some((t) => (Array.isArray(t) ? t.some((u) => u != null) : t != null))
  );
}

export function hasOsmTraceLine(
  fc: FeatureCollection | null | undefined,
): boolean {
  return fc?.features.some(isOsmTraceLine) ?? false;
}
