import type {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
  Position,
} from 'geojson';
import type { RecorderPoint } from './protocol.js';

/**
 * One fix as a GeoJSON coordinate. The altitude is omitted where the fix
 * carried none, so elevation-derived colorizers and the profile treat it as a
 * gap rather than as sea level.
 *
 * It is `altMsl` where the fix has one: GPX `<ele>` means metres above mean sea
 * level, and `alt` is above the ellipsoid — some 42 m higher over Slovakia.
 * `alt` remains the fallback because `altMsl` is null below Android 14 and
 * before the first GNSS fix.
 */
function coordinateOf(point: RecorderPoint): Position {
  const ele = point.altMsl ?? point.alt;

  return typeof ele === 'number' && Number.isFinite(ele)
    ? [point.lon, point.lat, ele]
    : [point.lon, point.lat];
}

/**
 * Adapts one recorded segment to the GeoJSON `LineString` the shared
 * colorizers, the elevation chart and the GPX writer consume.
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
      coordinates: points.map(coordinateOf),
    },
  };
}

/**
 * The whole recording as the single line the elevation chart draws: a
 * `MultiLineString` whose parts are the segments, so the profile breaks at each
 * pause instead of climbing across it — the chart's local path resets the climb
 * baseline and counts no distance between segments.
 *
 * One feature rather than the collection the hand-over produces, because the
 * chart draws one profile; the colorizers' per-point arrays, which are what
 * forbid a Multi geometry there, play no part here.
 *
 * `null` when fewer than two of the kept fixes carry an altitude: that is a
 * chart of gaps rather than a profile.
 */
export function recorderSegmentsToProfileFeature(
  segments: readonly (readonly RecorderPoint[])[],
): Feature<MultiLineString> | null {
  const coordinates = segments
    .filter((segment) => segment.length >= 2)
    .map((segment) => segment.map(coordinateOf));

  return countElevated(coordinates) < 2
    ? null
    : {
        type: 'Feature',
        properties: {},
        geometry: { type: 'MultiLineString', coordinates },
      };
}

function countElevated(segments: Position[][]): number {
  let n = 0;

  for (const segment of segments) {
    for (const coordinate of segment) {
      if (coordinate.length > 2 && ++n >= 2) {
        return n;
      }
    }
  }

  return n;
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
