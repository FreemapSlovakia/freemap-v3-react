import { describe, expect, it } from 'vitest';
import {
  legStops,
  stopEnd,
  timedPositions,
  waypointTimes,
} from './schedule.js';

// ~1.1 km per 0.01° of latitude.
const north = (i: number, ele = 500) => [20, 49 + i * 0.01, ele];

const leg = (from: number, to: number, duration: number) => ({
  steps: [
    {
      duration,
      geometry: {
        coordinates: Array.from({ length: to - from + 1 }, (_, i) =>
          north(from + i),
        ),
      },
    },
  ],
});

describe('timedPositions', () => {
  it('spreads a step’s duration over its length and joins steps', () => {
    const positions = timedPositions({
      legs: [
        {
          steps: [
            {
              duration: 600,
              geometry: {
                coordinates: [north(0, 500), north(1, 600), north(2, 700)],
              },
            },
            {
              duration: 300,
              geometry: { coordinates: [north(2, 700), north(3, 650)] },
            },
          ],
        },
      ],
    });

    expect(positions.map((p) => Math.round(p.seconds))).toEqual([
      0, 300, 600, 900,
    ]);

    expect(positions.map((p) => p.ele)).toEqual([500, 600, 700, 650]);
  });

  it('holds the route at a waypoint for its pause', () => {
    const positions = timedPositions(
      { legs: [leg(0, 1, 600), leg(1, 2, 600)] },
      [{ kind: 'pause', minutes: 30 }],
    );

    expect(positions.map((p) => [p.lat, p.seconds])).toEqual([
      [49, 0],
      [49.01, 600],
      // Leaving the waypoint after the pause.
      [49.01, 2400],
      [49.02, 3000],
    ]);

    expect(positions[1]?.stop).toEqual({ kind: 'pause', minutes: 30 });
  });

  it('goes on after a night at the time of day it says', () => {
    // 10:00 local; an hour to the hut, then on at 08:00 the next day.
    const departure = new Date(2026, 10, 20, 10).getTime();

    const positions = timedPositions(
      { legs: [leg(0, 1, 3600), leg(1, 2, 3600)] },
      [{ kind: 'overnight', resume: '08:00', nights: 1 }],
      departure,
    );

    const goesOn = new Date(departure + positions[2]!.seconds * 1000);

    expect([goesOn.getDate(), goesOn.getHours()]).toEqual([21, 8]);
  });

  it('ignores a stop at the finish', () => {
    const positions = timedPositions({ legs: [leg(0, 1, 600)] }, [
      { kind: 'pause', minutes: 30 },
    ]);

    expect(positions.at(-1)?.seconds).toBe(600);
  });
});

describe('legStops', () => {
  it('takes inner waypoints only, and only in a route in order', () => {
    const pause = { kind: 'pause', minutes: 10 } as const;

    const points = [{ stop: pause }, { stop: pause }, {}, { stop: pause }];

    expect(legStops('route', points)).toEqual([pause, undefined]);

    expect(legStops('trip', points)).toEqual([]);
  });
});

describe('waypointTimes', () => {
  it('reaches and leaves each waypoint, apart only at a stop', () => {
    const departure = new Date(2026, 10, 20, 10).getTime();

    const hour = 3_600_000;

    const times = waypointTimes(
      [3600, 7200, 1800],
      [{ kind: 'pause', minutes: 30 }, undefined],
      departure,
    );

    expect(
      times.map((t) =>
        [t.arrival, t.leave].map((ms) => (ms - departure) / hour),
      ),
    ).toEqual([
      [0, 0],
      [1, 1.5],
      [3.5, 3.5],
      [4, 4],
    ]);
  });
});

describe('stopEnd', () => {
  it('ends a night begun after midnight the same morning', () => {
    const end = new Date(
      stopEnd(
        { kind: 'overnight', resume: '08:00', nights: 1 },
        new Date(2026, 10, 22, 0, 30).getTime(),
      ),
    );

    expect([end.getDate(), end.getHours()]).toEqual([22, 8]);
  });

  it('spends two nights on a rest day', () => {
    const end = new Date(
      stopEnd(
        { kind: 'overnight', resume: '07:30', nights: 2 },
        new Date(2026, 10, 20, 17).getTime(),
      ),
    );

    expect([end.getDate(), end.getHours(), end.getMinutes()]).toEqual([
      22, 7, 30,
    ]);
  });
});
