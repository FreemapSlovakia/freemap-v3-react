import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  elevationTargets,
  polygonRings,
  targetsCoverage,
  withoutElevation,
  withPolygonRings,
} from './elevationTargets.js';

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
  it('are the lines, the points and the polygons', () => {
    expect(elevationTargets(collection)).toEqual({
      lines: [0],
      points: [1],
      polygons: [2],
    });
  });

  it('narrow to the one feature asked for', () => {
    expect(elevationTargets(collection, 1)).toEqual({
      lines: [],
      points: [1],
      polygons: [],
    });

    // A polygon's corners count as a line's vertices.
    expect(targetsCoverage(collection, 2)).toBe('none');
  });

  it('count a point without elevation as missing', () => {
    expect(targetsCoverage(collection)).toBe('partial');

    expect(targetsCoverage(collection, 0)).toBe('full');

    expect(targetsCoverage(collection, 1)).toBe('none');
  });

  it("puts a multi-polygon's rings back where they were", () => {
    const a = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ];

    const b = [
      [5, 5],
      [6, 5],
      [6, 6],
      [5, 5],
    ];

    const feature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [[a, a], [b]] },
    };

    const rings = polygonRings(feature.geometry);

    expect(rings).toEqual([a, a, b]);

    const raised = rings.map((ring) => ring.map(([x, y]) => [x!, y!, 100]));

    expect(withPolygonRings(feature, raised).geometry).toEqual({
      type: 'MultiPolygon',
      coordinates: [[raised[0], raised[1]], [raised[2]]],
    });

    expect(withoutElevation(withPolygonRings(feature, raised))).toEqual(
      feature,
    );
  });
});
