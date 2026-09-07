import { readPathDetails } from '@shared/colorizers/colorize.js';
import { distance } from '@turf/distance';
import type { Feature, LineString, MultiLineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  hasPerPointData,
  isMatchable,
  MATCH_MAX_BYTES,
  matchedSegment,
  segmentToGpx,
  trackSegments,
} from './matchTrack.js';

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

  const original = track(
    [
      [0, 0],
      [0.02, 0],
    ],
    { name: 'Sunday ride', coordinateProperties: { times: ['a', 'b'] } },
  );

  it('turns index ranges into metre spans', () => {
    const spans = readPathDetails(
      matchedSegment(response, original).feature,
      'surface',
    );

    expect(spans?.map((span) => span.value)).toEqual(['asphalt', 'gravel']);

    expect(spans?.[0]?.start).toBe(0);

    expect(spans?.[0]?.end).toBeCloseTo(spacing, 3);

    expect(spans?.[1]?.end).toBeCloseTo(2 * spacing, 3);
  });

  // A detail the router has no value for would otherwise become a category of
  // its own, painting the line as though something were known about it.
  it('drops a detail the router valued as null', () => {
    expect(
      readPathDetails(matchedSegment(response, original).feature, 'track_type'),
    ).toBeUndefined();
  });

  it('keeps the name but not the per-point arrays', () => {
    expect(hasPerPointData(original)).toBe(true);

    const matched = matchedSegment(response, original).feature;

    expect(matched.properties?.['name']).toBe('Sunday ride');

    // They index the recorded points, and the matched line has its own.
    expect(matched.properties?.['coordinateProperties']).toBeUndefined();

    expect(matched.geometry.coordinates).toHaveLength(3);
  });
});
