import { describe, expect, it } from 'vitest';
import { type EventsFilter, sameFilter } from './filter.js';
import { fromSavedFilter, toSavedFilter } from './savedFilters.js';

describe('saved filters', () => {
  it('keep a filter through the API units, dropping fixed dates', () => {
    const filter: EventsFilter = {
      within: '1m',
      near: { lat: 48.1, lon: 17.1, radius: 25 },
      transport: ['hiking'],
      distance: { min: 5.5, max: 20 },
      duration: { max: 1.5 },
      ascent: { min: 300 },
      difficulty: ['easy'],
      dogs: true,
      imported: false,
      unsaid: true,
    };

    const saved = toSavedFilter(filter);

    expect(saved).toMatchObject({
      distance: { min: 5500, max: 20000 },
      duration: { max: 5400 },
    });

    expect(sameFilter(fromSavedFilter(saved), filter)).toBe(true);

    expect(
      toSavedFilter({ from: new Date('2026-01-01'), transport: [] }),
    ).toEqual({});
  });

  it('bring a typed value back exactly and drop a transport the API refuses', () => {
    for (const km of [0.7, 1.4, 2.3, 2.8, 3.3, 49.9]) {
      expect(
        fromSavedFilter(toSavedFilter({ distance: { min: km } })).distance,
      ).toEqual({ min: km });
    }

    expect(toSavedFilter({ transport: ['hiking', 'Foo Bar'] })).toEqual({
      transport: ['hiking'],
    });
  });
});
