import { describe, expect, it } from 'vitest';
import type { EventSummary } from './actions.js';
import { sortEvents } from './listSort.js';

const ev = (
  id: string,
  start: string,
  lat: number,
  distance: number | null,
): EventSummary =>
  ({
    id,
    title: id,
    startAt: new Date(start),
    startPoint: { lat, lon: 17 },
    distance,
    ascent: null,
  }) as unknown as EventSummary;

const events = [
  ev('b', '2026-12-02', 49, 20_000),
  ev('a', '2026-12-01', 48, null),
  ev('c', '2026-12-03', 50, 5000),
];

const origins = {
  nearMap: { lat: 50, lon: 17 },
  nearHome: null,
  nearPlace: null,
};

const ids = (sort: Parameters<typeof sortEvents>[1]) =>
  sortEvents(events, sort, origins, 'sk').map(({ event }) => event.id);

describe('events list sort', () => {
  it('orders by start date', () => {
    expect(ids('date')).toEqual(['a', 'b', 'c']);
  });

  it('puts an event without the stat last, either way', () => {
    expect(ids('lengthAsc')).toEqual(['c', 'b', 'a']);

    expect(ids('lengthDesc')).toEqual(['b', 'c', 'a']);
  });

  it('orders by distance from the origin, giving each its km', () => {
    const sorted = sortEvents(events, 'nearMap', origins, 'sk');

    expect(sorted.map(({ event }) => event.id)).toEqual(['c', 'b', 'a']);

    expect(sorted[0]!.km).toBeCloseTo(0);
  });

  it('falls back to the date without an origin', () => {
    expect(ids('nearHome')).toEqual(['a', 'b', 'c']);
  });

  it('puts the most going first, ties by date', () => {
    const counted = [
      { ...events[0]!, goingCount: 0 },
      { ...events[1]!, goingCount: 0 },
      { ...events[2]!, goingCount: 2 },
    ];

    expect(
      sortEvents(counted, 'goingDesc', origins, 'sk').map(
        ({ event }) => event.id,
      ),
    ).toEqual(['c', 'a', 'b']);
  });
});
