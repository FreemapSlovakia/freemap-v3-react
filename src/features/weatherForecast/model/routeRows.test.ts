import { describe, expect, it } from 'vitest';
import { routeRows, timedPositions } from './routeRows.js';

// ~1.1 km per 0.01° of latitude.
const north = (i: number, ele: number) => [20, 49 + i * 0.01, ele];

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
});

describe('routeRows', () => {
  const HOUR = 3_600_000;

  // 08:00 UTC, so 6-hour steps fall on 12:00 and 18:00 UTC.
  const departure = Date.UTC(2026, 10, 20, 8);

  // A position every 15 minutes.
  const route = (n: number, peakAt: number) =>
    timedPositions({
      legs: [
        {
          steps: [
            {
              duration: n * 900,
              geometry: {
                coordinates: Array.from({ length: n + 1 }, (_, i) =>
                  north(i, i === peakAt ? 2000 : 500),
                ),
              },
            },
          ],
        },
      ],
    });

  const kindsAndHours = (rows: ReturnType<typeof routeRows>) =>
    rows.map((r) => [r.kind, (r.at - departure) / HOUR]);

  it('takes each hour, and the summit in place of the hour beside it', () => {
    expect(
      kindsAndHours(routeRows(route(12, 4), departure, departure)),
    ).toEqual([
      ['start', 0],
      ['highest', 1],
      ['along', 2],
      ['finish', 3],
    ]);
  });

  it('places each hour where the route is then', () => {
    const rows = routeRows(route(12, 4), departure, departure);

    // 2 hours in, 8 positions of ~1.1 km along.
    expect(rows[2]?.lat).toBeCloseTo(49.08);
  });

  it('thins a long trip to at most 24 rows', () => {
    const rows = routeRows(route(200, 30), departure, departure);

    expect(rows.length).toBeLessThanOrEqual(24);

    expect(rows.at(0)?.kind).toBe('start');

    expect(rows.at(-1)?.kind).toBe('finish');
  });

  it('goes by 6 hours from 00 UTC beyond the hourly forecast', () => {
    const rows = routeRows(route(60, 0), departure, departure - 3 * 24 * HOUR);

    expect(
      rows
        .filter((r) => r.kind === 'along')
        .map((r) => new Date(r.at).getUTCHours()),
    ).toEqual([12, 18]);
  });

  it('leaves out what is already past', () => {
    const rows = routeRows(route(12, 4), departure, departure + 90 * 60_000);

    expect(rows.map((r) => r.kind)).toEqual(['along', 'finish']);
  });
});
