import { describe, expect, it } from 'vitest';
import { trackEndpoints } from './trackEndpoints.js';
import type { TrackLine } from './trackSelection.js';

const line = (times: unknown[]): TrackLine => ({
  type: 'Feature',
  properties: { coordinateProperties: { times } },
  geometry: {
    type: 'LineString',
    coordinates: [
      [0, 0],
      [0.001, 0],
      [0.002, 0],
    ],
  },
});

describe('trackEndpoints', () => {
  it('reports the times of a track timed end to end', () => {
    const { startTime, finishTime } = trackEndpoints(
      line([
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:01:00Z',
        '2026-01-01T00:02:00Z',
      ]),
    )!;

    expect(startTime?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(finishTime?.toISOString()).toBe('2026-01-01T00:02:00.000Z');
  });

  it('reports none for a track timed over only part of its length', () => {
    // What a join with an untimed track leaves. Taking the first time there
    // would put the duration — and the average speed — over the whole length.
    const { startTime, finishTime } = trackEndpoints(
      line([null, null, '2026-01-01T00:02:00Z']),
    )!;

    expect(startTime).toBeUndefined();
    expect(finishTime?.toISOString()).toBe('2026-01-01T00:02:00.000Z');
  });
});
