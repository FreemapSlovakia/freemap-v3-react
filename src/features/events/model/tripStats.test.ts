import type { MapData } from '@features/myMaps/model/actions.js';
import type { Alternative } from '@features/routePlanner/model/actions.js';
import { describe, expect, it } from 'vitest';
import { tripStartOf, tripStatsOf } from './tripStats.js';

// Only what the stats read: the steps' coordinates, distance and duration.
function alternative(coordinates: number[][]): Alternative {
  return {
    legs: [
      {
        steps: [{ geometry: { type: 'LineString', coordinates } }],
        distance: 12_345.6,
        duration: 3_725.4,
      },
    ],
    distance: 12_345.6,
    duration: 3_725.4,
  } as unknown as Alternative;
}

function withRoute(coordinates: number[][]): MapData {
  return {
    routePlanner: {
      transportType: 'bike-osrm',
      result: {
        key: 'k',
        timestamp: 0,
        alternative: alternative(coordinates),
        waypoints: [],
      },
    },
  };
}

describe('tripStatsOf', () => {
  it('takes a route’s distance, duration and transport kind, rounded', () => {
    expect(
      tripStatsOf(
        withRoute([
          [19, 48],
          [19.01, 48],
        ]),
      ),
    ).toEqual({
      transports: ['bike'],
      distance: 12_346,
      duration: 3_725,
      ascent: null,
      descent: null,
    });
  });

  it('measures the climb where the route carries elevation', () => {
    const stats = tripStatsOf(
      withRoute([
        [19, 48, 300],
        [19.01, 48, 500],
        [19.02, 48, 400],
      ]),
    );

    expect(stats?.ascent).toBeGreaterThan(0);

    expect(stats?.descent).toBeGreaterThan(0);
  });

  it('falls back to the drawn lines’ length without a route', () => {
    const stats = tripStatsOf({
      lines: [
        {
          type: 'line',
          points: [
            { lat: 48, lon: 19, id: 0 },
            { lat: 48, lon: 19.01, id: 1 },
          ],
        },
      ],
    } as unknown as MapData);

    expect(stats?.transports).toEqual([]);

    expect(stats?.duration).toBeNull();

    // 0.01° of longitude at 48° N is about 744 m.
    expect(stats?.distance).toBeGreaterThan(700);

    expect(stats?.distance).toBeLessThan(800);
  });

  it('is null for a map with neither', () => {
    expect(tripStatsOf({})).toBeNull();
  });
});

describe('tripStartOf', () => {
  it('takes the route’s first point', () => {
    expect(
      tripStartOf({
        routePlanner: { points: [{ lat: 48.1, lon: 19.2, id: 0 }] },
      } as unknown as MapData),
    ).toEqual({ lat: 48.1, lon: 19.2 });
  });

  it('has no start for a finish-only route, falling back to the lines', () => {
    expect(
      tripStartOf({
        routePlanner: {
          finishOnly: true,
          points: [{ lat: 1, lon: 1, id: 0 }],
        },
        lines: [
          {
            type: 'line',
            points: [
              { lat: 48, lon: 19, id: 0 },
              { lat: 48, lon: 19.01, id: 1 },
            ],
          },
        ],
      } as unknown as MapData),
    ).toEqual({ lat: 48, lon: 19 });
  });

  it('is null for an empty map', () => {
    expect(tripStartOf({})).toBeNull();
  });
});
