import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { elevationTargets, targetsCoverage } from './elevationTargets.js';

const fc = (
  ...geometries: FeatureCollection['features'][number]['geometry'][]
): FeatureCollection => ({
  type: 'FeatureCollection',
  features: geometries.map((geometry) => ({
    type: 'Feature',
    properties: {},
    geometry,
  })),
});

const collection = fc(
  {
    type: 'LineString',
    coordinates: [
      [17, 48, 500],
      [17.1, 48.1, 510],
    ],
  },
  { type: 'Point', coordinates: [17, 48] },
  {
    type: 'Polygon',
    coordinates: [
      [
        [17, 48],
        [17.1, 48],
        [17.1, 48.1],
        [17, 48],
      ],
    ],
  },
);

describe('elevation targets', () => {
  it('are the lines and the points, never a polygon', () => {
    expect(elevationTargets(collection)).toEqual({ lines: [0], points: [1] });
  });

  it('narrow to the one feature asked for', () => {
    expect(elevationTargets(collection, 1)).toEqual({ lines: [], points: [1] });

    expect(targetsCoverage(collection, 2)).toBeUndefined();
  });

  it('count a point without elevation as missing', () => {
    expect(targetsCoverage(collection)).toBe('partial');

    expect(targetsCoverage(collection, 0)).toBe('full');

    expect(targetsCoverage(collection, 1)).toBe('none');
  });
});
