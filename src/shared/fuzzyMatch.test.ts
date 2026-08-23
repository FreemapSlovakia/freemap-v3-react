import { describe, expect, it } from 'vitest';
import { fuzzyMatch } from './fuzzyMatch.js';

function positions(query: string, target: string) {
  return fuzzyMatch(query, target)?.positions;
}

function score(query: string, target: string) {
  return fuzzyMatch(query, target)?.score ?? Number.NEGATIVE_INFINITY;
}

describe('fuzzyMatch', () => {
  it('matches a prefix', () => {
    expect(positions('rou', 'Route finder')).toEqual([0, 1, 2]);
  });

  it('matches characters spread over words', () => {
    expect(positions('rofi', 'Route finder')).toEqual([0, 1, 6, 7]);
  });

  it('ignores case and accents on both sides', () => {
    expect(positions('tienovanie', 'Tieňovanie terénu')).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);

    expect(positions('TIEŇ', 'Tieňovanie')).toEqual([0, 1, 2, 3]);
  });

  it('answers null when a character is missing or out of order', () => {
    expect(fuzzyMatch('routex', 'Route finder')).toBeNull();

    expect(fuzzyMatch('nifi', 'Route finder')).toBeNull();
  });

  it('answers null for an empty query', () => {
    expect(fuzzyMatch('', 'Route finder')).toBeNull();

    expect(fuzzyMatch('  ', 'Route finder')).toBeNull();
  });

  it('refuses characters smeared across words', () => {
    expect(fuzzyMatch('panora', 'plánovač trás')).toBeNull();

    expect(fuzzyMatch('ofi', 'Route finder')).toBeNull();
  });

  it('takes a query held whole inside a word', () => {
    expect(positions('radar', 'Meteoradar')).toEqual([5, 6, 7, 8, 9]);
  });

  it('takes a whole word from anywhere in the target', () => {
    expect(positions('finder', 'Route finder')).toEqual([6, 7, 8, 9, 10, 11]);
  });

  it('scores consecutive characters above scattered ones', () => {
    expect(score('rou', 'Route finder')).toBeGreaterThan(
      score('rou', 'Reset our map'),
    );
  });

  it('scores an early match above a late one', () => {
    expect(score('map', 'Map details')).toBeGreaterThan(
      score('map', 'Embed map'),
    );
  });
});
