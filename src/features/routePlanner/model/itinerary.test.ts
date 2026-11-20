import { describe, expect, it } from 'vitest';
import type { RoutePoint } from './actions.js';
import { itinerary } from './itinerary.js';
import { legStops, waypointTimes } from './schedule.js';

const at = (lat: number, extra: Partial<RoutePoint> = {}): RoutePoint => ({
  lat,
  lon: 20,
  ...extra,
});

const leg = (km: number, minutes: number) => ({
  distance: km * 1000,
  duration: minutes * 60,
});

const departure = Date.UTC(2026, 10, 20, 8);

const timesOf = (points: RoutePoint[], legs: { duration: number }[]) =>
  waypointTimes(
    legs.map((l) => l.duration),
    legStops('route', points),
    departure,
  );

describe('itinerary', () => {
  it('joins the legs across shaping points', () => {
    const result = itinerary(
      [at(0), at(1, { shaping: true }), at(2), at(3)],
      'hiking',
      [leg(1, 10), leg(2, 20), leg(3, 30)],
    );

    expect(result?.waypoints.map((w) => [w.index, w.metres])).toEqual([
      [0, 0],
      [2, 3000],
      [3, 6000],
    ]);

    expect(result?.legs).toMatchObject([
      { legs: [0, 1], metres: 3000, seconds: 1800, transports: ['hiking'] },
      { legs: [2, 2], metres: 3000, seconds: 1800, transports: ['hiking'] },
    ]);

    expect(result?.legs[0]?.joined).toHaveLength(2);
  });

  it('times the waypoints, waiting out a stop', () => {
    const points = [
      at(0),
      at(1, { stop: { kind: 'pause', minutes: 15 } }),
      at(2),
    ];

    const legs = [leg(1, 60), leg(1, 30)];

    const result = itinerary(points, 'hiking', legs, timesOf(points, legs));

    const hour = 3_600_000;

    expect(result?.waypoints.map((w) => [w.arrival, w.leave])).toEqual([
      [departure, departure],
      [departure + hour, departure + 1.25 * hour],
      [departure + 1.75 * hour, departure + 1.75 * hour],
    ]);

    expect(result?.waypoints[1]?.stop).toEqual({ kind: 'pause', minutes: 15 });

    // Moving time only.
    expect(result?.waypoints[2]?.seconds).toBe(1.5 * 3600);
  });

  it('lists each transport of a joined leg', () => {
    const result = itinerary(
      [at(0, { transport: 'car' }), at(1, { shaping: true }), at(2)],
      'hiking',
      [leg(1, 1), leg(1, 1)],
    );

    expect(result?.legs[0]?.transports).toEqual(['car', 'hiking']);
  });

  it('has no times without a departure', () => {
    const result = itinerary([at(0), at(1)], 'hiking', [leg(1, 1)]);

    expect(result?.waypoints[1]?.arrival).toBeUndefined();
  });

  it('waits for legs that belong to the points', () => {
    expect(itinerary([at(0), at(1), at(2)], 'hiking', [leg(1, 1)])).toBe(
      undefined,
    );
  });
});
