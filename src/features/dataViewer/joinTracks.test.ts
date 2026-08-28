import { PATH_DETAILS_PROP } from '@shared/colorizers/colorize.js';
import { describe, expect, it } from 'vitest';
import { joinTrackFeatures } from './joinTracks.js';
import type { TrackLine } from './trackSelection.js';

const line = (
  coordinates: number[][],
  properties: Record<string, unknown> = {},
): TrackLine => ({
  type: 'Feature',
  properties,
  geometry: { type: 'LineString', coordinates },
});

const multiLine = (
  coordinates: number[][][],
  properties: Record<string, unknown> = {},
): TrackLine => ({
  type: 'Feature',
  properties,
  geometry: { type: 'MultiLineString', coordinates },
});

/** A run of points a degree apart, starting at `from`. */
const run = (from: number, n: number) =>
  Array.from({ length: n }, (_, i): number[] => [from + i, 0]);

const cp = (feature: TrackLine) =>
  feature.properties!['coordinateProperties'] as Record<string, unknown>;

const times = (from: number, n: number) =>
  Array.from(
    { length: n },
    (_, i) => `2026-01-01T00:0${from + i}:00Z`,
  ) as unknown[];

describe('joinTrackFeatures — geometry', () => {
  it('joins into one line', () => {
    const joined = joinTrackFeatures(line(run(0, 3)), line(run(3, 3)), 'line');

    expect(joined.geometry).toEqual({
      type: 'LineString',
      coordinates: run(0, 6),
    });
  });

  it('joins into a segment each', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3)),
      line(run(3, 3)),
      'segments',
    );

    expect(joined.geometry).toEqual({
      type: 'MultiLineString',
      coordinates: [run(0, 3), run(3, 3)],
    });
  });

  it('keeps every segment of a multi-segment track', () => {
    const joined = joinTrackFeatures(
      multiLine([run(0, 2), run(3, 2)]),
      line(run(6, 2)),
      'segments',
    );

    expect(joined.geometry.coordinates).toHaveLength(3);
  });

  it('drops a vertex the two tracks share, joined into one line', () => {
    const joined = joinTrackFeatures(line(run(0, 3)), line(run(2, 3)), 'line');

    expect(joined.geometry.coordinates).toEqual(run(0, 5));
  });
});

describe('joinTrackFeatures — order', () => {
  it('turns the second track round to meet the first', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3)),
      line(run(3, 3).reverse()),
      'line',
    );

    expect(joined.geometry.coordinates).toEqual(run(0, 6));
  });

  it('puts the nearer track first, whichever was selected', () => {
    const joined = joinTrackFeatures(line(run(3, 3)), line(run(0, 3)), 'line');

    expect(joined.geometry.coordinates).toEqual(run(0, 6));
  });

  it('lets recorded times decide the order over the endpoints', () => {
    // The later track is the nearer one, but its times say it comes second.
    const joined = joinTrackFeatures(
      line(run(9, 3), {
        coordinateProperties: { times: times(3, 3) },
      }),
      line(run(0, 3), {
        coordinateProperties: { times: times(0, 3) },
      }),
      'line',
    );

    expect(joined.geometry.coordinates).toEqual([...run(0, 3), ...run(9, 3)]);
    expect(cp(joined)['times']).toEqual([...times(0, 3), ...times(3, 3)]);
  });

  it('never turns a timed track round', () => {
    const timed = line(run(3, 3), {
      coordinateProperties: { times: times(0, 3) },
    });

    // Reversing it would close the gap, but its times would then run backwards.
    const joined = joinTrackFeatures(timed, line(run(9, 3)), 'line');

    expect(joined.geometry.coordinates).toEqual([...run(3, 3), ...run(9, 3)]);
  });
});

describe('joinTrackFeatures — properties', () => {
  it('merges the names and keeps the first track’s own metadata', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3), { name: 'a', desc: 'mine' }),
      line(run(3, 3), { name: 'b', desc: 'theirs', src: 'watch' }),
      'line',
    );

    expect(joined.properties?.['name']).toBe('a, b');
    expect(joined.properties?.['desc']).toBe('mine');
    // What only the other track has is worth keeping.
    expect(joined.properties?.['src']).toBe('watch');
  });

  it('cuts the channels of both to the joined points', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3), { coordinateProperties: { heart: [1, 2, 3] } }),
      line(run(3, 3), { coordinateProperties: { heart: [4, 5, 6] } }),
      'line',
    );

    expect(cp(joined)['heart']).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('nests the channels per segment for a multi-segment result', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3), { coordinateProperties: { heart: [1, 2, 3] } }),
      line(run(3, 3), { coordinateProperties: { heart: [4, 5, 6] } }),
      'segments',
    );

    expect(cp(joined)['heart']).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('pads a channel the other track does not record', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3), { coordinateProperties: { heart: [1, 2, 3] } }),
      line(run(3, 3)),
      'line',
    );

    expect(cp(joined)['heart']).toEqual([1, 2, 3, null, null, null]);
  });

  it('re-bases the second track’s path details past the first', () => {
    const spans = [{ start: 0, end: 100, value: 'asphalt' }];

    const joined = joinTrackFeatures(
      line(
        [
          [0, 0],
          [0.001, 0],
        ],
        { [PATH_DETAILS_PROP]: { surface: spans } },
      ),
      line(
        [
          [0.001, 0],
          [0.002, 0],
        ],
        { [PATH_DETAILS_PROP]: { surface: spans } },
      ),
      'line',
    );

    const details = joined.properties![PATH_DETAILS_PROP] as Record<
      string,
      { start: number; end: number }[]
    >;

    const surface = details['surface']!;

    expect(surface[0]).toEqual({ start: 0, end: 100, value: 'asphalt' });
    // The first track is ~111 m of a degree's thousandth at the equator.
    expect(surface[1]!.start).toBeCloseTo(111, 0);
  });
});
