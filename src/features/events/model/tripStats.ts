import { documentFeatures } from '@features/dataViewer/model/collection.js';
import type { MapData } from '@features/myMaps/model/actions.js';
import { alternativeCoordinates } from '@features/routePlanner/model/routeGeometry.js';
import { elevationStats } from '@shared/geoutils.js';
import { length } from '@turf/length';
import type { LineString, MultiLineString } from 'geojson';
import type { EventPoint, TripStats } from './actions.js';
import { kindOf } from './transports.js';

type Line = LineString | MultiLineString;

const hasElevation = (line: Line) =>
  (line.type === 'LineString'
    ? line.coordinates
    : line.coordinates.flat()
  ).every((c) => typeof c[2] === 'number');

function climb(lines: Line[]): Pick<TripStats, 'ascent' | 'descent'> {
  if (lines.length === 0 || !lines.every(hasElevation)) {
    return { ascent: null, descent: null };
  }

  let ascent = 0;

  let descent = 0;

  for (const line of lines) {
    const stats = elevationStats(line);

    ascent += stats.ascent;

    descent += stats.descent;
  }

  return { ascent: Math.round(ascent), descent: Math.round(descent) };
}

/**
 * Where a map's trip starts: its route's start, or else the first drawn line's
 * first point, or the first drawn point. `null` when it has none.
 */
export function tripStartOf(data: MapData): EventPoint | null {
  const route = data.routePlanner;

  const routeStart = route?.finishOnly ? undefined : route?.points?.[0];

  if (routeStart) {
    return { lat: routeStart.lat, lon: routeStart.lon };
  }

  for (const { geometry } of documentFeatures(
    data.points,
    data.lines,
    data.trackViewer?.trackGeojson,
  )) {
    const first =
      geometry?.type === 'LineString'
        ? geometry.coordinates[0]
        : geometry?.type === 'MultiLineString'
          ? geometry.coordinates[0]?.[0]
          : geometry?.type === 'Point'
            ? geometry.coordinates
            : undefined;

    if (first) {
      return { lat: first[1]!, lon: first[0]! };
    }
  }

  return null;
}

/**
 * A map's trip stats: its saved route's, or else the length (and climb, where
 * they carry elevation) of its drawn lines. `null` when it has neither.
 */
export function tripStatsOf(data: MapData): TripStats | null {
  const route = data.routePlanner?.result;

  if (route) {
    const line: LineString = route.geometry?.geometry ?? {
      type: 'LineString',
      coordinates: alternativeCoordinates(route.alternative),
    };

    const kind = kindOf(data.routePlanner?.transportType ?? '');

    return {
      transports: kind ? [kind] : [],
      distance: Math.round(route.alternative.distance),
      duration: Math.round(route.alternative.duration),
      ...climb([line]),
    };
  }

  const lines = documentFeatures(
    data.points,
    data.lines,
    data.trackViewer?.trackGeojson,
  ).flatMap(({ geometry }) =>
    geometry?.type === 'LineString' || geometry?.type === 'MultiLineString'
      ? [geometry]
      : [],
  );

  if (lines.length === 0) {
    return null;
  }

  return {
    transports: [],
    distance: Math.round(
      lines.reduce(
        (sum, line) =>
          sum +
          length({ type: 'Feature', geometry: line, properties: {} }) * 1000,
        0,
      ),
    ),
    duration: null,
    ...climb(lines),
  };
}
