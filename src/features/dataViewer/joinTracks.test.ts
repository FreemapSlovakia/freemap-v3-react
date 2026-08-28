import { PATH_DETAILS_PROP } from '@shared/colorizers/colorize.js';
import { cumulativeDistances } from '@shared/geoutils.js';
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

const surfaceOf = (feature: TrackLine) =>
  (
    feature.properties![PATH_DETAILS_PROP] as Record<
      string,
      { start: number; end: number; value: string }[]
    >
  )['surface']!;

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

    const surface = surfaceOf(joined);

    expect(surface[0]).toEqual({ start: 0, end: 100, value: 'asphalt' });
    // The first track is ~111 m of a degree's thousandth at the equator.
    expect(surface[1]!.start).toBeCloseTo(111, 0);
  });
});

describe('joinTrackFeatures — times', () => {
  it('reads both spellings of the times as one channel', () => {
    const joined = joinTrackFeatures(
      line(run(0, 3), { coordTimes: times(0, 3) }),
      line(run(3, 3), { coordinateProperties: { times: times(3, 3) } }),
      'line',
    );

    expect(cp(joined)['times']).toEqual([...times(0, 3), ...times(3, 3)]);
    expect(joined.properties?.['coordTimes']).toBeUndefined();
  });

  it('never turns a track round whose times start past a padded gap', () => {
    const timed = line(
      [
        [2, 0],
        [1, 0],
        [0, 0],
      ],
      // What a join with an untimed track leaves: the times of one half only.
      { coordinateProperties: { times: [null, null, times(0, 1)[0]] } },
    );

    // Turning it round would close the gap, but its times would run backwards,
    // so the other track is the one that moves.
    const joined = joinTrackFeatures(timed, line(run(10, 3)), 'line');

    expect(joined.geometry.coordinates.slice(-3)).toEqual([
      [2, 0],
      [1, 0],
      [0, 0],
    ]);
  });
});

describe('joinTrackFeatures — segments', () => {
  it('leaves a track the way round it was drawn', () => {
    const backwards = [
      [2, 0],
      [1, 0],
      [0, 0],
    ];

    // The two stay apart, so there is no gap reversing it could close.
    const joined = joinTrackFeatures(
      line(backwards),
      line(run(10, 3)),
      'segments',
    );

    expect(joined.geometry.coordinates[0]).toEqual(backwards);
  });

  it('drops a segment with no line in it', () => {
    const joined = joinTrackFeatures(
      multiLine([[], [[9, 0]], run(0, 3)]),
      line(run(5, 2)),
      'segments',
    );

    expect(joined.geometry.coordinates).toEqual([run(0, 3), run(5, 2)]);
  });
});

describe('joinTrackFeatures — path details across a segment gap', () => {
  // Two ~111 m segments with a ~1001 m gap between them, measured as the joined
  // line measures it: every edge, the gap included.
  const cum = cumulativeDistances([
    [0, 0],
    [0.001, 0],
    [0.01, 0],
    [0.011, 0],
  ]);

  // The track's own axis leaves the gap out, so its second segment starts where
  // its first ended.
  const secondSegment = cum[1]!;

  const gapped = multiLine(
    [
      [
        [0, 0],
        [0.001, 0],
      ],
      [
        [0.01, 0],
        [0.011, 0],
      ],
    ],
    {
      [PATH_DETAILS_PROP]: {
        surface: [
          { start: 10, end: 100, value: 'asphalt' },
          {
            start: secondSegment + 20,
            end: secondSegment + 90,
            value: 'gravel',
          },
        ],
      },
    },
  );

  it('moves the spans past the gap the joined line counts as an edge', () => {
    const joined = joinTrackFeatures(gapped, line(run(1, 2)), 'line');

    const surface = surfaceOf(joined);

    // The first segment is measured the same way round either axis.
    expect(surface[0]!.start).toBeCloseTo(10, 6);
    expect(surface[0]!.end).toBeCloseTo(100, 6);

    expect(surface[1]!.start).toBeCloseTo(cum[2]! + 20, 6);
    expect(surface[1]!.end).toBeCloseTo(cum[2]! + 90, 6);
  });

  it('leaves them alone when the segments are kept apart', () => {
    const joined = joinTrackFeatures(gapped, line(run(1, 2)), 'segments');

    expect(surfaceOf(joined)[1]).toEqual({
      start: secondSegment + 20,
      end: secondSegment + 90,
      value: 'gravel',
    });
  });
});
