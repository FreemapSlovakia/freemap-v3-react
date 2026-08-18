import type { Feature, LineString, MultiLineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  containsElevations,
  elevationCoverage,
  formatLocationLines,
  lineSegments,
  trackTimeSegments,
} from './geoutils.js';

const line = (coords: number[][]): Feature<LineString> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: coords },
});

const multiLine = (segments: number[][][]): Feature<MultiLineString> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiLineString', coordinates: segments },
});

describe('lineSegments', () => {
  it('wraps a LineString as a single segment', () => {
    expect(
      lineSegments(
        line([
          [0, 0],
          [1, 1],
        ]).geometry,
      ),
    ).toEqual([
      [
        [0, 0],
        [1, 1],
      ],
    ]);
  });

  it('returns each part of a MultiLineString', () => {
    const segs = [
      [
        [0, 0],
        [1, 1],
      ],
      [
        [2, 2],
        [3, 3],
      ],
    ];

    expect(lineSegments(multiLine(segs).geometry)).toEqual(segs);
  });
});

describe('containsElevations', () => {
  it('is true only when every LineString coordinate has a z', () => {
    expect(
      containsElevations(
        line([
          [0, 0, 10],
          [1, 1, 20],
        ]),
      ),
    ).toBe(true);
    expect(
      containsElevations(
        line([
          [0, 0, 10],
          [1, 1],
        ]),
      ),
    ).toBe(false);
    expect(containsElevations(line([]))).toBe(false);
  });

  it('requires every coordinate of every MultiLineString segment to have a z', () => {
    expect(
      containsElevations(
        multiLine([
          [
            [0, 0, 10],
            [1, 1, 20],
          ],
          [
            [2, 2, 30],
            [3, 3, 40],
          ],
        ]),
      ),
    ).toBe(true);

    // One segment missing elevation makes the whole track incomplete.
    expect(
      containsElevations(
        multiLine([
          [
            [0, 0, 10],
            [1, 1, 20],
          ],
          [
            [2, 2],
            [3, 3],
          ],
        ]),
      ),
    ).toBe(false);
  });

  it('is false for non-line geometry', () => {
    expect(
      containsElevations({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0, 10] },
      }),
    ).toBe(false);
  });
});

describe('elevationCoverage', () => {
  it('classifies a single LineString', () => {
    expect(
      elevationCoverage([
        line([
          [0, 0, 1],
          [1, 1, 2],
        ]),
      ]),
    ).toBe('full');
    expect(
      elevationCoverage([
        line([
          [0, 0, 1],
          [1, 1],
        ]),
      ]),
    ).toBe('partial');
    expect(
      elevationCoverage([
        line([
          [0, 0],
          [1, 1],
        ]),
      ]),
    ).toBe('none');
    expect(elevationCoverage([])).toBe('none');
  });

  it('aggregates across MultiLineString segments', () => {
    expect(
      elevationCoverage([
        multiLine([
          [
            [0, 0, 1],
            [1, 1, 2],
          ],
          [
            [2, 2, 3],
            [3, 3, 4],
          ],
        ]),
      ]),
    ).toBe('full');

    // Elevation present in one segment but not the other → partial.
    expect(
      elevationCoverage([
        multiLine([
          [
            [0, 0, 1],
            [1, 1, 2],
          ],
          [
            [2, 2],
            [3, 3],
          ],
        ]),
      ]),
    ).toBe('partial');
  });
});

describe('trackTimeSegments', () => {
  const withTimes = (times: unknown): Feature => ({
    type: 'Feature',
    properties: { coordinateProperties: { times } },
    geometry: { type: 'Point', coordinates: [0, 0] },
  });

  it('wraps a flat (single-LineString) times array as one segment', () => {
    expect(trackTimeSegments(withTimes(['t0', 't1']))).toEqual([['t0', 't1']]);
  });

  it('returns a nested (multi-segment) times array as-is', () => {
    expect(trackTimeSegments(withTimes([['a', 'b'], ['c']]))).toEqual([
      ['a', 'b'],
      ['c'],
    ]);
  });

  it('reads a top-level coordTimes (live tracking)', () => {
    expect(
      trackTimeSegments({
        type: 'Feature',
        properties: { coordTimes: ['t0', 't1'] },
        geometry: { type: 'Point', coordinates: [0, 0] },
      }),
    ).toEqual([['t0', 't1']]);
  });

  it('is empty when there are no times', () => {
    expect(
      trackTimeSegments({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      }),
    ).toEqual([]);
  });
});

describe('formatLocationLines', () => {
  it('writes latitude over longitude in whole seconds', () => {
    expect(formatLocationLines({ lat: 49.013621, lon: 20.169882 })).toBe(
      'N 49° 0\' 49"\nE 20° 10\' 12"',
    );
  });

  it('names the hemisphere each side of zero', () => {
    expect(formatLocationLines({ lat: -33.9, lon: -18.4 })).toBe(
      'S 33° 54\' 0"\nW 18° 24\' 0"',
    );
  });

  it('carries into the next minute rather than writing 60 seconds', () => {
    // 59.9995' would round to 60" a naive way; the whole angle is rounded once.
    expect(formatLocationLines({ lat: 1 - 0.1 / 3600, lon: 0 })).toBe(
      'N 1° 0\' 0"\nE 0° 0\' 0"',
    );
  });
});
