import type { Feature, FeatureCollection, LineString } from 'geojson';
import type { RecorderPoint } from './protocol.js';

/**
 * Adapts one recorded segment to the GeoJSON `LineString` the shared
 * colorizers, the elevation chart and the GPX writer consume. Coordinates are
 * `[lon, lat, altitude?]` — altitude omitted when the fix carried none, so
 * elevation-derived colorizers treat it as a gap.
 *
 * The altitude is `altMsl` where the fix has one: GPX `<ele>` means metres above
 * mean sea level, and `alt` is above the ellipsoid — some 42 m higher over
 * Slovakia. `alt` remains the fallback because `altMsl` is null below Android 14
 * and before the first GNSS fix.
 *
 * The per-point series use togeojson's names (`times`, `speeds`, `courses`,
 * `accuracies`), because that is the shape an imported GPX track arrives in:
 * `gpxFromGeojson` reads exactly these back out into `<time>` and the
 * trackpoint extensions, and the colorizers read them the same way whatever the
 * track's origin. `brg` goes to `courses` — it is the direction of travel, not
 * a compass heading.
 */
export function recorderSegmentToFeature(
  points: readonly RecorderPoint[],
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {
      coordinateProperties: {
        times: points.map((p) => new Date(p.ts).toISOString()),
        speeds: points.map((p) => p.spd),
        courses: points.map((p) => p.brg),
        accuracies: points.map((p) => p.acc),
      },
    },
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) => {
        const ele = p.altMsl ?? p.alt;

        return typeof ele === 'number' && Number.isFinite(ele)
          ? [p.lon, p.lat, ele]
          : [p.lon, p.lat];
      }),
    },
  };
}

/**
 * The recording as a collection the track viewer can hold like any import.
 *
 * One feature per segment rather than a single `MultiLineString`: the
 * colorizers require a per-point array as long as the line's own coordinates,
 * so the nested arrays a Multi geometry carries would make every value-based
 * colorize mode unavailable. Segments too short to be a line are dropped.
 */
export function recorderSegmentsToFeatureCollection(
  segments: readonly (readonly RecorderPoint[])[],
): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: segments
      .filter((segment) => segment.length >= 2)
      .map(recorderSegmentToFeature),
  };
}
