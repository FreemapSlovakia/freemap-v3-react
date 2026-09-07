import {
  PATH_DETAILS_PROP,
  type PathDetails,
  remapPathDetails,
} from '@shared/colorizers/colorize.js';
import { lineSegments } from '@shared/geoutils.js';
import {
  midLatitude,
  simplifyGeometry,
  simplifyIndices,
} from '@shared/simplifyGeo.js';
import type {
  Feature,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from 'geojson';
import { vertexDistances } from './splitTrack.js';
import {
  isAveragable,
  meanSample,
  readChannels,
  writeChannels,
} from './trackChannels.js';
import { isTrackLine, type TrackLine } from './trackSelection.js';

/**
 * The stretch of source points each surviving vertex stands for, `to`
 * inclusive: everything up to the midpoint of the gap either side of it. Index
 * midpoints rather than distance ones — a recording samples on a clock, so this
 * is what weights a sensor mean by time.
 */
function runsOf(kept: number[], length: number): [number, number][] {
  return kept.map((index, k) => [
    k === 0 ? 0 : Math.floor((kept[k - 1]! + index) / 2) + 1,
    k === kept.length - 1 ? length - 1 : Math.floor((index + kept[k + 1]!) / 2),
  ]);
}

/**
 * The track with the vertices Douglas–Peucker drops taken out of its geometry,
 * its per-point channels and its path details alike. `null` when the tolerance
 * finds nothing to drop.
 *
 * A surviving vertex carries the mean of the samples it now stands for, not
 * just its own: DP keeps corners, and corners are junctions and switchbacks, so
 * taking one sample per survivor would bias a recording towards wherever it
 * slowed down. See {@link isAveragable} for what is left at its own vertex.
 */
export function simplifyTrackFeature(
  feature: TrackLine,
  tolerance: number,
): TrackLine | null {
  const segments = lineSegments(feature.geometry);

  // One reference latitude for the lot, so every segment is thinned alike.
  const lat = midLatitude(segments);

  const kept = segments.map((segment) =>
    simplifyIndices(segment, tolerance, lat),
  );

  if (kept.every((indices, i) => indices.length === segments[i]!.length)) {
    return null;
  }

  const coordinates = kept.map((indices, i) =>
    indices.map((j) => segments[i]![j]!),
  );

  const geometry: LineString | MultiLineString =
    feature.geometry.type === 'LineString'
      ? { type: 'LineString', coordinates: coordinates[0] ?? [] }
      : { type: 'MultiLineString', coordinates };

  const properties = { ...feature.properties };

  const runs = kept.map((indices, i) => runsOf(indices, segments[i]!.length));

  writeChannels(
    properties,
    readChannels(feature),
    geometry.type === 'LineString',
    (channel) =>
      kept.map((indices, i) => {
        const source = channel.segments[i]!;

        if (!isAveragable(channel)) {
          return indices.map((j) => source[j]);
        }

        return indices.map((j, k) => {
          const [from, to] = runs[i]![k]!;

          return meanSample(source.slice(from, to + 1)) ?? source[j];
        });
      }),
  );

  const details = feature.properties?.[PATH_DETAILS_PROP] as
    | PathDetails
    | undefined;

  if (details) {
    const before = vertexDistances(feature);

    properties[PATH_DETAILS_PROP] = remapPathDetails(
      details,
      kept.flatMap((indices, i) => indices.map((j) => before[i]![j]!)),
      vertexDistances({ ...feature, geometry }).flat(),
    );
  }

  return { ...feature, geometry, properties };
}

function positionCount(geometry: Polygon | MultiPolygon): number {
  const rings =
    geometry.type === 'Polygon'
      ? geometry.coordinates
      : geometry.coordinates.flat();

  return rings.reduce((n, ring) => n + ring.length, 0);
}

/** Geometry a tolerance can thin — everything but points. */
export function isSimplifiable(feature: Feature): boolean {
  const { type } = feature.geometry;

  return (
    type === 'LineString' ||
    type === 'MultiLineString' ||
    type === 'Polygon' ||
    type === 'MultiPolygon'
  );
}

/**
 * One loaded feature simplified, or `null` where there is nothing to simplify —
 * points, and geometry the tolerance leaves as it is.
 */
export function simplifyDataFeature(
  feature: Feature,
  tolerance: number,
): Feature | null {
  if (isTrackLine(feature)) {
    return simplifyTrackFeature(feature, tolerance);
  }

  const { geometry } = feature;

  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return null;
  }

  const simplified = simplifyGeometry(geometry, tolerance);

  return positionCount(simplified) === positionCount(geometry)
    ? null
    : { ...feature, geometry: simplified };
}
