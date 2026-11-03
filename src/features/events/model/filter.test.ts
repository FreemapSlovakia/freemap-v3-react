import { describe, expect, it } from 'vitest';
import {
  type EventsFilter,
  filterFromQuery,
  filterToQuery,
  filterToRequest,
  sameFilter,
} from './filter.js';

const full: EventsFilter = {
  from: new Date('2026-11-01'),
  to: new Date('2026-11-30'),
  inMapArea: true,
  transport: ['hiking', 'mtb'],
  distance: { min: 5, max: 20 },
  duration: { max: 4 },
  ascent: { min: 300 },
  difficulty: ['easy', 'moderate'],
  dogs: true,
  children: false,
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

    expect(filterToRequest(invalid)).toEqual({});
  });

  it('drops unknown difficulties from a link', () => {
    expect(filterFromQuery({ 'events-difficulty': 'easy,impossible' })).toEqual(
      { difficulty: ['easy'] },
    );
  });

  it('sends ranges in meters and seconds', () => {
    expect(filterToRequest(full)).toMatchObject({
      transport: 'hiking,mtb',
      minDistance: '5000',
      maxDistance: '20000',
      maxDuration: '14400',
      minAscent: '300',
      difficulty: 'easy,moderate',
      dogs: '1',
      children: '0',
    });
  });
});
