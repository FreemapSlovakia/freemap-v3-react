import { PATH_DETAILS_PROP } from '@shared/colorizers/colorize.js';
import type { Feature, Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  isSimplifiable,
  simplifyDataFeature,
  simplifyTrackFeature,
} from './simplifyTrack.js';
import { vertexDistances } from './splitTrack.js';
import type { TrackLine } from './trackSelection.js';

const METERS_PER_DEGREE = 111320;

/** A run along the equator, every odd point pushed `meters` off it. */
const zigzag = (n: number, meters: number): Position[] =>
  Array.from({ length: n }, (_, i) => [
    (i * 10 * meters) / METERS_PER_DEGREE,
    i % 2 ? meters / METERS_PER_DEGREE : 0,
  ]);

const lineString = (
  coordinates: Position[],
  properties: Record<string, unknown> = {},
): TrackLine => ({
  type: 'Feature',
  properties: { name: 'a', ...properties },
  geometry: { type: 'LineString', coordinates },
});

describe('simplifyTrackFeature', () => {
  // Each survivor stands for the points up to the midpoint of the gap either
  // side of it, so of five points the first takes 0–2 and the last 3–4.
  it('averages a sensor channel over the points a vertex stands for', () => {
    const feature = lineString(zigzag(5, 1), {
      coordinateProperties: { heart: [60, 62, 70, 80, 90] },
    });

    const simplified = simplifyTrackFeature(feature, 5)!;

    expect(simplified.geometry.coordinates).toHaveLength(2);

    expect(simplified.properties!['coordinateProperties']).toEqual({
      heart: [64, 85],
    });
  });

  it('keeps whole samples whole, and lets fractional ones stay fractional', () => {
    const feature = lineString(zigzag(3, 1), {
      coordinateProperties: { heart: [60, 61, 63], speeds: [1.5, 3.5, 4] },
    });

    expect(
      simplifyTrackFeature(feature, 5)!.properties!['coordinateProperties'],
    ).toEqual({ heart: [61, 63], speeds: [2.5, 4] });
  });

  // A time has to keep matching the place it was recorded at, and a mean of
  // 350° and 10° is 180°.
  it('leaves times and angles at their own vertex', () => {
    const feature = lineString(zigzag(5, 1), {
      coordTimes: ['t0', 't1', 't2', 't3', 't4'],
      coordinateProperties: { courses: [350, 355, 0, 5, 10] },
    });

    const simplified = simplifyTrackFeature(feature, 5)!;

    // The root spelling is the same channel, written back where readers look.
    expect(simplified.properties!['coordTimes']).toBeUndefined();

    expect(simplified.properties!['coordinateProperties']).toEqual({
      courses: [350, 10],
      times: ['t0', 't4'],
    });
  });

  it('falls back to the vertex where a channel is not numeric', () => {
    const feature = lineString(zigzag(5, 1), {
      coordinateProperties: { notes: ['a', 'b', 'c', 'd', 'e'] },
    });

    expect(
      simplifyTrackFeature(feature, 5)!.properties!['coordinateProperties'],
    ).toEqual({ notes: ['a', 'e'] });
  });

  it('leaves elevation on the vertices that survive', () => {
    const feature = lineString(
      zigzag(5, 1).map((p, i) => [p[0]!, p[1]!, 100 + i * 10]),
    );

    expect(simplifyTrackFeature(feature, 5)!.geometry.coordinates).toEqual([
      [0, 0, 100],
      [expect.any(Number), 0, 140],
    ]);
  });

  it('re-measures the path details along the shortened line', () => {
    // A bulge to the east: dropping it makes the line measurably shorter.
    const coordinates: Position[] = [
      [0, 0],
      [0.0005, 0.5],
      [0, 1],
    ];

    const before = vertexDistances(lineString(coordinates)).at(-1)!.at(-1)!;

    const feature = lineString(coordinates, {
      [PATH_DETAILS_PROP]: {
        surface: [{ start: 0, end: before, value: 'asphalt' }],
      },
    });

    const kept = simplifyTrackFeature(feature, 100)!;

    const after = vertexDistances(kept).at(-1)!.at(-1)!;

    expect(kept.geometry.coordinates).toHaveLength(2);

    expect(after).toBeLessThan(before);

    const [span] = (
      kept.properties![PATH_DETAILS_PROP] as {
        surface: { start: number; end: number }[];
      }
    ).surface;

    expect(span!.start).toBe(0);

    // The span covered the whole line and still does, at its new length.
    expect(span!.end).toBeCloseTo(after, 6);
  });

  it('keeps the spans either side of a segment gap apart', () => {
    // Two bulging segments far apart. Their own axis leaves the gap out, so the
    // second's first vertex sits at the same distance as the first's last —
    // the two spans must not run into one another across it.
    const segment = (lon: number): Position[] => [
      [lon, 0],
      [lon + 0.0005, 0.5],
      [lon, 1],
    ];

    const coordinates = [segment(0), segment(10)];

    const feature: TrackLine = {
      type: 'Feature',
      properties: { name: 'a' },
      geometry: { type: 'MultiLineString', coordinates },
    };

    const half = vertexDistances(feature)[0]!.at(-1)!;

    const whole = vertexDistances(feature)[1]!.at(-1)!;

    const simplified = simplifyTrackFeature(
      {
        ...feature,
        properties: {
          ...feature.properties,
          [PATH_DETAILS_PROP]: {
            surface: [
              { start: 0, end: half, value: 'asphalt' },
              { start: half, end: whole, value: 'gravel' },
            ],
          },
        },
      },
      100,
    )!;

    const kept = vertexDistances(simplified);

    const { surface } = simplified.properties![PATH_DETAILS_PROP] as {
      surface: { start: number; end: number; value: string }[];
    };

    // Each span still covers exactly its own segment of the shortened line.
    expect(surface[0]!.start).toBe(0);
    expect(surface[0]!.end).toBeCloseTo(kept[0]!.at(-1)!, 6);
    expect(surface[1]!.start).toBeCloseTo(kept[1]![0]!, 6);
    expect(surface[1]!.end).toBeCloseTo(kept[1]!.at(-1)!, 6);
  });

  it('leaves a line the tolerance cannot thin alone', () => {
    expect(simplifyTrackFeature(lineString(zigzag(5, 10)), 5)).toBeNull();
  });

  // The channels have to be laid out the way the geometry is, or the GPX
  // exporter reads a number where it expects a segment and drops the lot.
  it('keeps a one-segment MultiLineString nested', () => {
    const feature: TrackLine = {
      type: 'Feature',
      properties: {
        coordinateProperties: { heart: [[60, 61, 62, 63, 64]] },
      },
      geometry: { type: 'MultiLineString', coordinates: [zigzag(5, 1)] },
    };

    const simplified = simplifyTrackFeature(feature, 5)!;

    expect(simplified.geometry.type).toBe('MultiLineString');

    expect(simplified.properties!['coordinateProperties']).toEqual({
      heart: [[61, 64]],
    });
  });

  it('keeps a multi-segment track multi-segment', () => {
    const feature: TrackLine = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [zigzag(5, 1), zigzag(5, 1)],
      },
    };

    const geometry = simplifyTrackFeature(feature, 5)!.geometry;

    expect(geometry.type).toBe('MultiLineString');

    expect(
      (geometry.coordinates as Position[][]).map((part) => part.length),
    ).toEqual([2, 2]);
  });
});

describe('simplifyDataFeature', () => {
  it('has nothing to do to a point', () => {
    const point: Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    };

    expect(isSimplifiable(point)).toBe(false);

    expect(simplifyDataFeature(point, 5)).toBeNull();
  });

  it('thins a polygon ring', () => {
    const polygon: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0.0001],
            [2, 0],
            [2, 2],
            [0, 2],
            [0, 0],
          ],
        ],
      },
    };

    expect(isSimplifiable(polygon)).toBe(true);

    expect(simplifyDataFeature(polygon, 100)!.geometry).toEqual({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2],
          [0, 0],
        ],
      ],
    });
  });
});
