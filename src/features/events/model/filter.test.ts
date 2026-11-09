import { describe, expect, it } from 'vitest';
import {
  type EventsFilter,
  filterFromQuery,
  filterToQuery,
  filterToRequest,
  localDayStart,
  nearestRadiusStop,
  RADIUS_STOPS,
  sameFilter,
} from './filter.js';

// Node rereads TZ on assignment.
function withTz(tz: string, run: () => void) {
  const prev = process.env['TZ'];

  process.env['TZ'] = tz;

  try {
    run();
  } finally {
    if (prev === undefined) {
      delete process.env['TZ'];
    } else {
      process.env['TZ'] = prev;
    }
  }
}

const full: EventsFilter = {
  from: new Date('2026-11-01'),
  to: new Date('2026-11-30'),
  near: { lat: 48.14816, lon: 17.10674, radius: 25 },
  transport: ['hiking', 'mtb'],
  distance: { min: 5, max: 20 },
  duration: { max: 4 },
  ascent: { min: 300 },
  difficulty: ['easy', 'moderate'],
  dogs: true,
  children: false,
  imported: false,
  unsaid: true,
};

describe('events filter', () => {
  it('round-trips through the URL', () => {
    const query = Object.fromEntries(filterToQuery(full));

    expect(query).toMatchObject({
      'events-transport': 'hiking,mtb',
      'events-length': '5-20',
      'events-duration': '-4',
      'events-ascent': '300-',
    });

    expect(sameFilter(filterFromQuery(query), full)).toBe(true);
  });

  it('reads nothing from a malformed range', () => {
    expect(filterFromQuery({ 'events-length': 'abc' })).toEqual({});
  });

  it('writes an invalid date as no bound rather than throwing', () => {
    const invalid = {
      from: new Date('+275760-09-14'),
      to: new Date(Number.NaN),
    };

    expect(filterToQuery(invalid)).toEqual([]);

    const now = new Date('2026-11-03T12:00:00Z');

    withTz('Europe/Bratislava', () =>
      expect(filterToRequest(invalid, now)).toEqual({
        from: now.toISOString(),
        fromDay: '2026-11-03T00:00:00+01:00',
      }),
    );
  });

  it('reads no place from a link without a valid radius or point', () => {
    expect(filterFromQuery({ 'events-near': '48.1,17.1' })).toEqual({});

    expect(
      filterFromQuery({ 'events-near': '48.1', 'events-radius': '25' }),
    ).toEqual({});

    expect(
      filterFromQuery({ 'events-near': '48.1,17.1', 'events-radius': '0' }),
    ).toEqual({});
  });

  it('puts a typed radius on the nearest slider stop', () => {
    const stopOf = (km: number) => RADIUS_STOPS[nearestRadiusStop(km)];

    expect(stopOf(1)).toBe(10);

    expect(stopOf(25)).toBe(25);

    expect(stopOf(33)).toBe(35);

    expect(stopOf(17)).toBe(18);

    expect(stopOf(260)).toBe(250);

    expect(stopOf(1000)).toBe(1000);
  });

  it("writes a day's local start with its offset", () => {
    const cases: [string, string, string][] = [
      ['Europe/Bratislava', '2026-11-09', '2026-11-09T00:00:00+01:00'],
      ['America/St_Johns', '2026-11-09', '2026-11-09T00:00:00-03:30'],
      ['Asia/Kolkata', '2026-11-09', '2026-11-09T00:00:00+05:30'],
      // DST skips its midnight.
      ['America/Santiago', '2026-09-06', '2026-09-06T01:00:00-03:00'],
    ];

    for (const [tz, day, start] of cases) {
      withTz(tz, () => expect(localDayStart(day)).toBe(start));
    }

    // Local mean time, +0:57:44, as an offset the API's parser takes.
    withTz('Europe/Prague', () => {
      for (const day of ['1850-01-01', '0050-01-01']) {
        expect(localDayStart(day)).toMatch(
          new RegExp(`^${day}T00:00:00\\+00:5\\d$`),
        );
      }
    });
  });

  it('asks for what has not ended yet unless the dates say otherwise', () => {
    const now = new Date('2026-11-03T12:00:00Z');

    const fromOf = (f: EventsFilter) => filterToRequest(f, now)['from'];

    expect(fromOf({})).toBe(now.toISOString());

    const fromDayOf = (f: EventsFilter) => filterToRequest(f, now)['fromDay'];

    withTz('Pacific/Kiritimati', () => {
      expect(fromDayOf({})).toBe('2026-11-04T00:00:00+14:00');

      expect(fromDayOf({ from: new Date('2026-01-01') })).toBe(
        '2026-01-01T00:00:00+14:00',
      );

      // A picked start is its local day's start.
      expect(fromOf({ from: new Date('2026-01-01') })).toBe(
        '2025-12-31T10:00:00.000Z',
      );
    });

    expect(fromDayOf({ to: new Date('2026-10-01') })).toBeUndefined();

    // Up to today still means from now on; an end in the past means the past.
    expect(fromOf({ to: new Date('2026-11-03') })).toBe(now.toISOString());

    expect(fromOf({ to: new Date('2026-10-01') })).toBeUndefined();
  });

  it('drops unknown difficulties from a link', () => {
    expect(filterFromQuery({ 'events-difficulty': 'easy,impossible' })).toEqual(
      { difficulty: ['easy'] },
    );
  });

  it('sends ranges in meters and seconds', () => {
    expect(filterToRequest(full)).toMatchObject({
      near: '48.14816,17.10674',
      radius: '25',
      transport: 'hiking,mtb',
      minDistance: '5000',
      maxDistance: '20000',
      maxDuration: '14400',
      minAscent: '300',
      difficulty: 'easy,moderate',
      dogs: '1',
      children: '0',
      imported: '0',
      unsaid: '1',
    });
  });
});
