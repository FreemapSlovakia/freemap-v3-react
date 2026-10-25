import { elevationCoverage } from '@shared/geoutils.js';
import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Position,
} from 'geojson';
import { isTrackLine } from '../trackSelection.js';

/** What "Update elevation" fills: every line and point, or the one asked for. */
export function elevationTargets(
  collection: FeatureCollection | null,
  index?: number,
): { lines: number[]; points: number[] } {
  const lines: number[] = [];

  const points: number[] = [];

  for (const [i, feature] of (collection?.features ?? []).entries()) {
    if (index !== undefined && i !== index) {
      continue;
    }

    if (feature.geometry?.type === 'Point') {
      points.push(i);
    } else if (isTrackLine(feature)) {
      lines.push(i);
    }
  }

  return { lines, points };
}

/** A point or line with its positions' elevation taken off. */
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

    default:
      return feature;
  }
}

/** How much of the targets' elevation is there: as `elevationCoverage`, points included. */
export function targetsCoverage(
  collection: FeatureCollection | null,
  index?: number,
): 'none' | 'partial' | 'full' | undefined {
  const { lines, points } = elevationTargets(collection, index);

  if (!lines.length && !points.length) {
    return undefined;
  }

  const features = collection!.features;

  // A point counts as a one-vertex line.
  return elevationCoverage([
    ...lines.map((i) => features[i] as Feature<LineString>),
    ...points.map(
      (i): Feature<LineString> => ({
        type: 'Feature',
        properties: null,
        geometry: {
          type: 'LineString',
          coordinates: [(features[i] as Feature<Point>).geometry.coordinates],
        },
      }),
    ),
  ]);
}
