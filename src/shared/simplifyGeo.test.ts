import type { Point, Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  simplifyGeometry,
  simplifyIndices,
  simplifyPositions,
  simplifyRing,
} from './simplifyGeo.js';

const METERS_PER_DEGREE = 111320;

/** A run along a parallel, every odd point pushed `meters` off it. */
function zigzag(n: number, meters: number, lat = 0): Position[] {
  const d = meters / METERS_PER_DEGREE;

  return Array.from({ length: n }, (_, i) => [
    i * 10 * d,
    lat + (i % 2 ? d : 0),
  ]);
}

/** The same run, but wobbling east–west while heading north. */
function zigzagAcross(n: number, meters: number, lat: number): Position[] {
  const d = meters / METERS_PER_DEGREE / Math.cos((lat * Math.PI) / 180);

  return Array.from({ length: n }, (_, i) => [
    i % 2 ? d : 0,
    lat + i * 10 * (meters / METERS_PER_DEGREE),
  ]);
}

describe('simplifyIndices', () => {
  it('keeps the ends and drops what falls within the tolerance', () => {
    expect(simplifyIndices(zigzag(5, 1), 5)).toEqual([0, 4]);
  });

  it('keeps what sticks out further than the tolerance', () => {
    expect(simplifyIndices(zigzag(5, 10), 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it('keeps everything at zero tolerance', () => {
    expect(simplifyIndices(zigzag(5, 10), 0)).toEqual([0, 1, 2, 3, 4]);
  });

  // The whole point of measuring in metres: a degree of longitude is worth less
  // than one of latitude, so the same wobble has to weigh the same either way.
  it('measures east–west and north–south alike', () => {
    for (const lat of [0, 48.7, 68]) {
      expect(simplifyIndices(zigzagAcross(5, 10, lat), 5).length).toBe(5);

      expect(simplifyIndices(zigzagAcross(5, 1, lat), 5)).toEqual([0, 4]);
    }
  });
});

describe('simplifyPositions', () => {
  it('gives back the very same array when nothing goes', () => {
    const points = zigzag(5, 10);

    expect(simplifyPositions(points, 5)).toBe(points);
  });
});

describe('simplifyRing', () => {
  it('eases the tolerance rather than letting a ring collapse', () => {
    // A square barely a metre across: a 100 m tolerance would flatten it.
    const ring: Position[] = [
      [0, 0],
      [1e-5, 0],
      [1e-5, 1e-5],
      [0, 1e-5],
      [0, 0],
    ];

    expect(simplifyRing(ring, 100).length).toBeGreaterThanOrEqual(4);
  });
});

describe('simplifyGeometry', () => {
  it('thins every segment of a MultiLineString', () => {
    expect(
      simplifyGeometry(
        {
          type: 'MultiLineString',
          coordinates: [zigzag(5, 1), zigzag(5, 1)],
        },
        5,
      ).coordinates.map((line) => line.length),
    ).toEqual([2, 2]);
  });

  it('leaves a point alone', () => {
    const point: Point = { type: 'Point', coordinates: [0, 0] };

    expect(simplifyGeometry(point, 5)).toBe(point);
  });
});
