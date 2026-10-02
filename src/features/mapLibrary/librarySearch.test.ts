import { describe, expect, it } from 'vitest';
import { prepareSearchTarget, searchLibrary } from './librarySearch.js';

const items = [
  { name: 'Orthophoto Slovakia', extras: ['sk', 'aerial, imagery'] },
  { name: 'Cadastre', extras: ['sk', 'Slovakia', 'parcels'] },
  { name: 'Hiking trails', extras: ['cz', 'Czechia'] },
];

const targets = items.map((item) =>
  prepareSearchTarget(item.name, item.extras),
);

const search = (query: string, limit = 10) =>
  searchLibrary(items, targets, query, limit);

describe('searchLibrary', () => {
  it('matches nothing for an empty query', () => {
    expect(search('  ')).toEqual({ matches: [], total: 0 });
  });

  it('ranks a name hit above an extra hit', () => {
    expect(search('slovakia').matches.map((item) => item.name)).toEqual([
      'Orthophoto Slovakia',
      'Cadastre',
    ]);
  });

  it('finds an entry by an extra alone', () => {
    expect(search('parcels').matches.map((item) => item.name)).toEqual([
      'Cadastre',
    ]);
  });

  it('caps the matches but counts them all', () => {
    const result = search('slovakia', 1);

    expect(result.matches).toHaveLength(1);

    expect(result.total).toBe(2);
  });

  it('does not gather a query from across several extras', () => {
    expect(search('skparcels').total).toBe(0);
  });
});
