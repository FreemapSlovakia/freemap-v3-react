import { elevationCoverage } from '@shared/geoutils.js';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Point,
  Position,
} from 'geojson';
import { isTrackLine } from '../trackSelection.js';

/**
 * What "Update elevation" fills: every line, point and polygon, or the one
 * asked for.
 */
export function elevationTargets(
  collection: FeatureCollection | null,
  index?: number,
): { lines: number[]; points: number[]; polygons: number[] } {
  const lines: number[] = [];

  const points: number[] = [];

  const polygons: number[] = [];

  for (const [i, feature] of (collection?.features ?? []).entries()) {
    if (index !== undefined && i !== index) {
      continue;
    }

    const type = feature.geometry?.type;

    if (type === 'Point') {
      points.push(i);
    } else if (type === 'Polygon' || type === 'MultiPolygon') {
      polygons.push(i);
    } else if (isTrackLine(feature)) {
      lines.push(i);
    }
  }

  return { lines, points, polygons };
}

/** A polygon's or multi-polygon's rings, all of them, in order. */
export function polygonRings(geometry: Geometry): Position[][] {
  return geometry.type === 'Polygon'
    ? geometry.coordinates
    : geometry.type === 'MultiPolygon'
      ? geometry.coordinates.flat()
      : [];
}

/** The polygon with its rings, in `polygonRings`' order, replaced. */
export function withPolygonRings(
  feature: Feature,
  rings: Position[][],
): Feature {
  const { geometry } = feature;

  if (geometry.type === 'Polygon') {
    return { ...feature, geometry: { ...geometry, coordinates: rings } };
  }

  if (geometry.type === 'MultiPolygon') {
    let at = 0;

    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) =>
          polygon.map(() => rings[at++]!),
        ),
      },
    };
  }

  return feature;
}

/** A point, line or polygon with its positions' elevation taken off. */
export function withoutElevation(feature: Feature): Feature {
  const flat = (p: Position): Position => [p[0]!, p[1]!];

  const { geometry } = feature;

  switch (geometry?.type) {
    case 'Point':
      return {
        ...feature,
        geometry: { ...geometry, coordinates: flat(geometry.coordinates) },
      };

    case 'LineString':
      return {
        ...feature,
        geometry: { ...geometry, coordinates: geometry.coordinates.map(flat) },
      };

    case 'MultiLineString':
      return {
        ...feature,
        geometry: {
          ...geometry,
          coordinates: geometry.coordinates.map((part) => part.map(flat)),
        },
      };

    case 'Polygon':
    case 'MultiPolygon':
      return withPolygonRings(
        feature,
        polygonRings(geometry).map((ring) => ring.map(flat)),
      );

    default:
      return feature;
  }
}

const asLine = (coordinates: Position[]): Feature<LineString> => ({
  type: 'Feature',
  properties: null,
  geometry: { type: 'LineString', coordinates },
});

/**
 * How much of the targets' elevation is there: as `elevationCoverage`, a point
 * counting as a one-vertex line and a polygon's ring as a line.
 */
export function targetsCoverage(
  collection: FeatureCollection | null,
  index?: number,
): 'none' | 'partial' | 'full' | undefined {
  const { lines, points, polygons } = elevationTargets(collection, index);

  if (!lines.length && !points.length && !polygons.length) {
    return undefined;
  }

  const features = collection!.features;

  return elevationCoverage([
    ...lines.map((i) => features[i] as Feature<LineString>),
    ...points.map((i) =>
      asLine([(features[i] as Feature<Point>).geometry.coordinates]),
    ),
    ...polygons.flatMap((i) => polygonRings(features[i]!.geometry).map(asLine)),
  ]);
}
