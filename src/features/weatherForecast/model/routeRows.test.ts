import { timedPositions } from '@features/routePlanner/model/schedule.js';
import { describe, expect, it } from 'vitest';
import { routeRows } from './routeRows.js';

// ~1.1 km per 0.01° of latitude.
const north = (i: number, ele: number) => [20, 49 + i * 0.01, ele];

describe('routeRows', () => {
  const HOUR = 3_600_000;

  // 08:00 UTC.
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

  it('stays hourly days ahead', () => {
    const rows = routeRows(route(16, 0), departure, departure - 10 * 24 * HOUR);

    expect(
      rows
        .filter((r) => r.kind === 'along')
        .map((r) => new Date(r.at).getUTCHours()),
    ).toEqual([9, 10, 11]);
  });

  it('leaves out what is already past', () => {
    const rows = routeRows(route(12, 4), departure, departure + 90 * 60_000);

    expect(rows.map((r) => r.kind)).toEqual(['along', 'finish']);
  });

  it('gives a stop one row for its whole length', () => {
    const leg = (from: number) => ({
      steps: [
        {
          duration: 2 * 3600,
          geometry: { coordinates: [north(from, 500), north(from + 1, 500)] },
        },
      ],
    });

    // Two hours to the hut, a 5-hour pause there, two more hours on.
    const rows = routeRows(
      timedPositions({ legs: [leg(0), leg(1)] }, [
        { kind: 'pause', minutes: 300 },
      ]),
      departure,
      departure,
    );

    expect(kindsAndHours(rows)).toEqual([
      ['start', 0],
      ['along', 1],
      ['stop', 2],
      ['along', 8],
      ['finish', 9],
    ]);

    expect(rows[2]?.until).toBe(departure + 7 * HOUR);
  });
});
