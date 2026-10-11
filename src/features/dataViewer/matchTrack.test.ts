import type { PathDetails } from '@shared/colorizers/colorize.js';
import { colorizers } from '@shared/colorizers/index.js';
import { distance } from '@turf/distance';
import type { Feature, LineString, MultiLineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  asRecordedPart,
  isMatchable,
  MATCH_MAX_BYTES,
  matchedSegment,
  matchedTrack,
  segmentToGpx,
  trackSegments,
} from './matchTrack.js';
import { trackLineParts } from './trackLineParts.js';

function track(
  coordinates: number[][],
  properties: Record<string, unknown> = {},
): Feature<LineString> {
  return {
    type: 'Feature',
    properties,
    geometry: { type: 'LineString', coordinates },
  };
}

/** Spacing of the test lines below, in metres. */
const spacing = distance([0, 0], [0.01, 0], { units: 'meters' });

describe('trackSegments', () => {
  it('keeps the segments of a multi-line apart, with their own times', () => {
    const multi: Feature<MultiLineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [17, 48],
            [17.01, 48],
          ],
          [
            [18, 48],
            [18.01, 48],
          ],
        ],
      },
    };

    const segments = trackSegments(multi);

    expect(segments).toHaveLength(2);

    // The ~74 km between the two is not travelled distance: each segment is
    // measured on its own, which is what the plausibility check compares to.
    const own = distance([17, 48], [17.01, 48], { units: 'meters' });

    expect(segments[0]?.length).toBeCloseTo(own, 3);

    expect(segments[1]?.length).toBeCloseTo(own, 3);
  });

  it('leaves a stray fragment unmatchable', () => {
    const [tiny] = trackSegments(
      track([
        [17, 48],
        [17.0001, 48],
      ]),
    );

    expect(isMatchable(tiny!)).toBe(false);

    const [real] = trackSegments(
      track([
        [17, 48],
        [17.01, 48],
      ]),
    );

    expect(isMatchable(real!)).toBe(true);
  });
});

describe('segmentToGpx', () => {
  const gpxOf = (coordinates: number[][], times?: string[]) =>
    segmentToGpx(
      trackSegments(
        track(coordinates, times && { coordinateProperties: { times } }),
      )[0]!,
    );

  it('carries elevation and times where the segment has them', () => {
    const gpx = gpxOf(
      [
        [17, 48, 512],
        [17.01, 48, 530],
      ],
      ['2020-01-01T00:00:00.000Z', '2020-01-01T00:00:10.000Z'],
    );

    expect(gpx).toContain('<ele>512</ele>');

    expect(gpx).toContain('<time>2020-01-01T00:00:00.000Z</time>');
  });

  // The matcher walks time steps, but a segment without them still matches on
  // geometry alone — an empty `<time>` would be worse than none.
  it('omits times a segment does not have', () => {
    expect(gpxOf([[17, 48]])).not.toContain('<time>');
  });

  it('thins a dense recording, keeping the ends', () => {
    const dense = Array.from({ length: 4000 }, (_, i) => [
      17 + i * 0.00001,
      48,
    ]);

    const gpx = gpxOf(dense);

    expect(gpx.match(/<trkpt /g)?.length ?? 0).toBeLessThan(dense.length / 20);

    expect(gpx).toContain(`lon="17"`);

    // The last point is always kept, so thinning cannot shorten the segment.
    expect(gpx).toContain(`lon="${17 + 3999 * 0.00001}"`);
  });

  it('keeps a long segment inside the request limit', () => {
    // 400 km at 2 m spacing — 200 000 points, ~19 MB unthinned.
    const long = Array.from({ length: 200_000 }, (_, i) => [
      17 + i * 0.00002,
      48,
      500,
    ]);

    expect(new Blob([gpxOf(long)]).size).toBeLessThan(MATCH_MAX_BYTES);
  });
});

describe('matchedSegment', () => {
  // `/match` reports detail ranges as indices into its own returned points,
  // where every colorize mode wants metres along the line.
  const response = {
    paths: [
      {
        points: {
          type: 'LineString',
          coordinates: [
            [0, 0, 100],
            [0.01, 0, 110],
            [0.02, 0, 120],
          ],
        },
        details: {
          surface: [
            [0, 1, 'asphalt'],
            [1, 2, 'gravel'],
          ],
          track_type: [[0, 2, null]],
        },
      },
    ],
  };

  it('turns index ranges into metre spans', () => {
    const { details } = matchedSegment(response);

    expect(details['surface']?.map((span) => span.value)).toEqual([
      'asphalt',
      'gravel',
    ]);

    expect(details['surface']?.[0]?.start).toBe(0);

    expect(details['surface']?.[0]?.end).toBeCloseTo(spacing, 3);

    expect(details['surface']?.[1]?.end).toBeCloseTo(2 * spacing, 3);
  });

  // A detail the router has no value for would otherwise become a category of
  // its own, painting the line as though something were known about it.
  it('drops a detail the router valued as null', () => {
    expect(matchedSegment(response).details['track_type']).toBeUndefined();
  });
});

describe('matchedTrack', () => {
  /** A paused recording: two segments, both with times and heart rate. */
  const recording: Feature<MultiLineString> = {
    type: 'Feature',
    properties: {
      name: 'Ráno do hôr',
      coordinateProperties: {
        times: [
          ['2020-01-01T00:00:00.000Z', '2020-01-01T00:00:10.000Z'],
          ['2020-01-01T01:00:00.000Z', '2020-01-01T01:00:10.000Z'],
        ],
        heart: [
          [100, 110],
          [120, 130],
        ],
      },
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [0.01, 0],
        ],
        [
          [0.02, 0],
          [0.03, 0],
        ],
      ],
    },
  };

  const second = trackSegments(recording)[1]!;

  /** The recording with its first segment matched and its second one broken. */
  const matched = matchedTrack(
    [
      {
        coordinates: [
          [0, 0],
          [0.01, 0],
          [0.02, 0],
        ],
        channels: null,
        details: {
          surface: [{ start: 0, end: 2 * spacing, value: 'asphalt' }],
        },
      },
      asRecordedPart(second),
    ],
    recording,
  );

  it('keeps the recording as one feature, with a part per segment', () => {
    expect(matched.geometry.type).toBe('MultiLineString');

    expect((matched.geometry as MultiLineString).coordinates).toHaveLength(2);

    expect(matched.properties?.['name']).toBe('Ráno do hôr');
  });

  // The spans of a segment are metres from that segment's own start, so the
  // array is what a colorizer reads its part's spans by.
  it('carries one entry of spans per part', () => {
    const details = matched.properties?.['fm:pathDetails'] as PathDetails[];

    expect(details).toHaveLength(2);

    expect(details[0]?.['surface']?.[0]?.value).toBe('asphalt');

    expect(details[1]).toEqual({});
  });

  // A segment kept exactly as recorded has the recorded points, so its rows of
  // per-point values still line up — there is nothing to drop them for.
  it('keeps the per-point arrays of a segment kept as recorded', () => {
    const cp = matched.properties?.['coordinateProperties'] as Record<
      string,
      unknown[]
    >;

    expect(cp['heart']).toEqual([
      [null, null, null],
      [120, 130],
    ]);

    expect((cp['times'] as string[][])[1]).toEqual([
      '2020-01-01T01:00:00.000Z',
      '2020-01-01T01:00:10.000Z',
    ]);
  });

  it('slices the channels of every segment, timed or not', () => {
    expect(trackSegments(recording)[0]?.channels['heart']).toEqual([100, 110]);
  });

  // The recording is one entry in the viewer, but each part still has to reach a
  // colorizer with the spans of that part — which is what the flatten for
  // colorizing is for.
  it('colorizes each part with the spans of that part', () => {
    const parts = trackLineParts({
      type: 'FeatureCollection',
      features: [matched],
    });

    expect(parts).toHaveLength(2);

    expect(colorizers['surface'].isAvailable?.(parts)).toBe(true);
  });
});
