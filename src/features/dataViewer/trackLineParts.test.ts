import { PATH_DETAILS_PROP } from '@shared/colorizers/colorize.js';
import { colorizers } from '@shared/colorizers/index.js';
import { cumulativeDistances } from '@shared/geoutils.js';
import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { trackLineParts } from './trackLineParts.js';

const times = (from: number, n: number) =>
  Array.from({ length: n }, (_, i) => `2026-01-01T00:0${from + i}:00Z`);

/** A paused recording: two segments, times and heart rate nested per segment. */
const recording: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        coordinateProperties: {
          times: [times(0, 2), times(4, 2)],
          heart: [
            [120, 121],
            [130, 131],
          ],
        },
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [0.001, 0],
          ],
          [
            [0.01, 0],
            [0.011, 0],
          ],
        ],
      },
    },
  ],
};

// Both segments are a thousandth of a degree long, at the equator.
const segment = cumulativeDistances([
  [0, 0],
  [0.001, 0],
])[1]!;

describe('trackLineParts', () => {
  it('cuts the channels of a multi-segment track to each segment', () => {
    const parts = trackLineParts(recording);

    expect(parts).toHaveLength(2);

    const cp = (i: number) =>
      parts[i]!.properties!['coordinateProperties'] as Record<string, unknown>;

    expect(cp(0)['times']).toEqual(times(0, 2));
    expect(cp(1)['times']).toEqual(times(4, 2));
    expect(cp(1)['heart']).toEqual([130, 131]);
  });

  it('leaves the modes that read them available', () => {
    const parts = trackLineParts(recording);

    for (const mode of ['time', 'speed', 'heartRate'] as const) {
      expect(colorizers[mode].isAvailable?.(parts)).toBe(true);
    }
  });

  it('re-bases the path details of each segment onto its own line', () => {
    const [, second] = trackLineParts({
      ...recording,
      features: recording.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          // The gap between the segments is not in this measure, so the second
          // starts where the first ended.
          [PATH_DETAILS_PROP]: {
            surface: [
              { start: 0, end: segment, value: 'asphalt' },
              { start: segment, end: 2 * segment, value: 'gravel' },
            ],
          },
        },
      })),
    });

    const surface = (
      second!.properties![PATH_DETAILS_PROP] as Record<
        string,
        { start: number; end: number; value: string }[]
      >
    )['surface']!;

    expect(surface).toHaveLength(1);
    expect(surface[0]!.value).toBe('gravel');
    expect(surface[0]!.start).toBe(0);
    expect(surface[0]!.end).toBeCloseTo(segment, 6);
  });
});
