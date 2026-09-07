import { describe, expect, it } from 'vitest';
import {
  explodeTrackFeature,
  isExplodable,
  isSplittable,
  nearestTrackVertex,
  splitTrackCoordinates,
  splitTrackFeature,
  vertexDistances,
} from './splitTrack.js';
import type { TrackLine } from './trackSelection.js';

const coords = (n: number) =>
  Array.from({ length: n }, (_, i): [number, number] => [i, 0]);

const lineString = (n: number, properties = {}): TrackLine => ({
  type: 'Feature',
  properties: { name: 'a', ...properties },
  geometry: { type: 'LineString', coordinates: coords(n) },
});

const multiLineString = (lengths: number[], properties = {}): TrackLine => ({
  type: 'Feature',
  properties: { name: 'a', ...properties },
  geometry: {
    type: 'MultiLineString',
    coordinates: lengths.map((n) => coords(n)),
  },
});

const cp = (f: TrackLine) =>
  f.properties!['coordinateProperties'] as Record<string, unknown>;

const times = (n: number) =>
  Array.from({ length: n }, (_, i) => `2026-01-01T00:00:0${i}Z`);

describe('isSplittable', () => {
  it('needs a vertex between the ends', () => {
    expect(isSplittable(lineString(2))).toBe(false);
    expect(isSplittable(lineString(3))).toBe(true);
  });

  it('counts a second segment as something to cut', () => {
    expect(isSplittable(multiLineString([2, 2]))).toBe(true);
  });

  // A recorder can leave a lone point behind after a pause; it draws nothing,
  // so it is not a piece either side of a cut.
  it('does not count a segment of one point', () => {
    expect(isSplittable(multiLineString([1, 2]))).toBe(false);
    expect(isExplodable(multiLineString([1, 2]))).toBe(false);
    expect(isExplodable(multiLineString([2, 2]))).toBe(true);
  });
});

describe('splitTrackFeature', () => {
  it('gives the cut vertex to both halves', () => {
    const [head, tail] = splitTrackFeature(lineString(5), 0, 2)!;

    expect(head.geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
    });

    expect(tail.geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [2, 0],
        [3, 0],
        [4, 0],
      ],
    });
  });

  it('refuses a cut at either end', () => {
    expect(splitTrackFeature(lineString(5), 0, 0)).toBeNull();
    expect(splitTrackFeature(lineString(5), 0, 4)).toBeNull();
  });

  it('keeps the properties on both halves', () => {
    const [head, tail] = splitTrackFeature(
      lineString(5, { 'fm:kind': 'track' }),
      0,
      2,
    )!;

    expect(head.properties?.['name']).toBe('a');
    expect(tail.properties?.['fm:kind']).toBe('track');
  });

  it('cuts the per-point channels alongside the coordinates', () => {
    const feature = lineString(5, {
      coordinateProperties: { times: times(5), heart: [1, 2, 3, 4, 5] },
    });

    const [head, tail] = splitTrackFeature(feature, 0, 2)!;

    expect(cp(head)['heart']).toEqual([1, 2, 3]);
    expect(cp(tail)['heart']).toEqual([3, 4, 5]);
    expect(cp(head)['times']).toEqual(times(5).slice(0, 3));
    expect(cp(tail)['times']).toEqual(times(5).slice(2));
  });

  it('cuts a root-spelled times channel into coordinateProperties', () => {
    const [head, tail] = splitTrackFeature(
      lineString(4, { coordTimes: times(4) }),
      0,
      1,
    )!;

    expect(cp(head)['times']).toEqual(times(4).slice(0, 2));
    expect(cp(tail)['times']).toEqual(times(4).slice(1));

    expect(head.properties?.['coordTimes']).toBeUndefined();
  });

  it('leaves a channel that does not line up untouched', () => {
    const [head] = splitTrackFeature(
      lineString(5, { coordinateProperties: { heart: [1, 2] } }),
      0,
      2,
    )!;

    expect(cp(head)['heart']).toEqual([1, 2]);
  });

  it('splits a multi-segment recording into the segments either side', () => {
    const [head, tail] = splitTrackFeature(multiLineString([3, 4, 3]), 1, 1)!;

    expect(head.geometry.type).toBe('MultiLineString');
    expect((head.geometry as { coordinates: unknown[] }).coordinates).toEqual([
      coords(3),
      coords(4).slice(0, 2),
    ]);

    expect(tail.geometry.type).toBe('MultiLineString');
    expect((tail.geometry as { coordinates: unknown[] }).coordinates).toEqual([
      coords(4).slice(1),
      coords(3),
    ]);
  });

  it('cuts a segment-nested channel with the segments', () => {
    const feature = multiLineString([3, 4], {
      coordinateProperties: { times: [times(3), times(4)] },
    });

    const [head, tail] = splitTrackFeature(feature, 1, 1)!;

    expect(cp(head)['times']).toEqual([times(3), times(4).slice(0, 2)]);

    // A single-segment half comes out a flat LineString, and so do its channels.
    expect(tail.geometry.type).toBe('LineString');
    expect(cp(tail)['times']).toEqual(times(4).slice(1));
  });

  it('drops a half left with a single point', () => {
    // Cutting the first vertex of the second segment leaves that segment's
    // head alone in the head half, so it goes and the head is the first
    // segment as a plain line.
    const [head, tail] = splitTrackFeature(multiLineString([3, 4]), 1, 0)!;

    expect(head.geometry.type).toBe('LineString');
    expect((head.geometry as { coordinates: unknown[] }).coordinates).toEqual(
      coords(3),
    );

    expect(tail.geometry.type).toBe('LineString');
    expect((tail.geometry as { coordinates: unknown[] }).coordinates).toEqual(
      coords(4),
    );
  });
});

describe('explodeTrackFeature', () => {
  it('gives each segment a feature of its own', () => {
    const parts = explodeTrackFeature(
      multiLineString([3, 4], {
        coordinateProperties: { times: [times(3), times(4)] },
      }),
    )!;

    expect(parts).toHaveLength(2);
    expect(parts.map((p) => p.geometry.type)).toEqual([
      'LineString',
      'LineString',
    ]);
    expect(cp(parts[1]!)['times']).toEqual(times(4));
  });

  it('has nothing to give a single-segment track', () => {
    expect(explodeTrackFeature(lineString(5))).toBeNull();
    expect(explodeTrackFeature(multiLineString([4]))).toBeNull();
  });
});

describe('nearestTrackVertex', () => {
  it('finds the vertex across segments', () => {
    const feature: TrackLine = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [1, 0],
          ],
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
        ],
      },
    };

    expect(nearestTrackVertex(feature, 0.9, 1.9)).toMatchObject({
      segmentIndex: 1,
      pointIndex: 2,
    });
  });
});

describe('splitTrackCoordinates', () => {
  it('draws both halves up to the cut vertex', () => {
    const { head, tail } = splitTrackCoordinates(lineString(5), 0, 2);

    expect(head).toEqual([coords(3)]);
    expect(tail).toEqual([coords(5).slice(2)]);
  });

  it('leaves out a piece with nothing to draw', () => {
    const { head, tail } = splitTrackCoordinates(multiLineString([3, 4]), 1, 0);

    expect(head).toEqual([coords(3)]);
    expect(tail).toEqual([coords(4)]);
  });
});

describe('splitTrackFeature — router path details', () => {
  const spans = vertexDistances(lineString(5))[0]!;

  const feature = lineString(5, {
    ['fm:pathDetails']: {
      surface: [
        { start: 0, end: spans[2]!, value: 'asphalt' },
        { start: spans[2]!, end: spans[4]!, value: 'gravel' },
      ],
    },
  });

  it('measures the spans from each half of its own start', () => {
    const [head, tail] = splitTrackFeature(feature, 0, 2)!;

    expect(head.properties?.['fm:pathDetails']).toEqual({
      surface: [{ start: 0, end: spans[2]!, value: 'asphalt' }],
    });

    expect(tail.properties?.['fm:pathDetails']).toEqual({
      surface: [{ start: 0, end: spans[4]! - spans[2]!, value: 'gravel' }],
    });
  });

  it('clips a span the cut runs through', () => {
    const [head, tail] = splitTrackFeature(feature, 0, 3)!;

    expect(
      (head.properties!['fm:pathDetails'] as { surface: unknown[] }).surface,
    ).toHaveLength(2);

    expect(tail.properties?.['fm:pathDetails']).toEqual({
      surface: [{ start: 0, end: spans[4]! - spans[3]!, value: 'gravel' }],
    });
  });
});
