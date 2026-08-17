import { FM_KIND, type FmKind } from '@features/dataViewer/provenance.js';
import type { Feature, FeatureCollection, LineString, Position } from 'geojson';
import type { Track, TrackPoint } from './model/types.js';
import { trackLineSegments } from './tracks.js';

// Altitude is omitted where the device reported none, so elevation-derived
// colorizers and the profile treat it as a gap rather than as sea level.
function coordinateOf(point: TrackPoint): Position {
  return typeof point.altitude === 'number' && Number.isFinite(point.altitude)
    ? [point.lon, point.lat, point.altitude]
    : [point.lon, point.lat];
}

/**
 * Adapts tracking points to the GeoJSON `LineString` shape the shared colorizers
 * and the elevation chart consume. Coordinates are `[lon, lat, altitude?]`
 * (altitude omitted when the device didn't report one, so elevation-derived
 * colorizers treat it as a gap), with the per-point series the colorizers read:
 * `coordTimes` (speed/time) and `coordinateProperties` (battery, gsmSignal).
 */
export function trackPointsToFeature(
  points: TrackPoint[],
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {
      coordTimes: points.map((p) => p.ts.toISOString()),
      coordinateProperties: {
        battery: points.map((p) => p.battery ?? null),
        gsmSignal: points.map((p) => p.gsmSignal ?? null),
      },
    },
    geometry: {
      type: 'LineString',
      coordinates: points.map(coordinateOf),
    },
  };
}

/**
 * One segment as the track viewer holds an imported track: stamped as a
 * recording, named after the device, and carrying the per-point series under
 * togeojson's plural names — that is what the GPX writer reads back out into
 * `<time>` and the trackpoint extensions. `battery` and `gsmSignal` have no GPX
 * home and stay for the colorizers alone.
 */
function segmentToTrackFeature(
  points: TrackPoint[],
  label: string | null | undefined,
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {
      [FM_KIND]: 'track' satisfies FmKind,
      ...(label ? { name: label } : null),
      coordinateProperties: {
        times: points.map((p) => p.ts.toISOString()),
        speeds: points.map((p) => p.speed ?? null),
        // The direction of travel, which is what togeojson's `courses` means.
        courses: points.map((p) => p.bearing ?? null),
        accuracies: points.map((p) => p.accuracy ?? null),
        battery: points.map((p) => p.battery ?? null),
        gsmSignal: points.map((p) => p.gsmSignal ?? null),
      },
    },
    geometry: {
      type: 'LineString',
      coordinates: points.map(coordinateOf),
    },
  };
}

/**
 * Live tracks as a collection the track viewer can hold like any import — one
 * feature per continuous segment, so every per-point colorize mode stays
 * available (a Multi geometry's nested arrays would rule them out).
 */
export function tracksToFeatureCollection(tracks: Track[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: tracks.flatMap((track) =>
      trackLineSegments(track).map((segment) =>
        segmentToTrackFeature(segment, track.label),
      ),
    ),
  };
}
