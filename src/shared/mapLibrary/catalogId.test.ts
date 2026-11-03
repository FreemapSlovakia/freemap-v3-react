import { describe, expect, it } from 'vitest';
import { isCatalogId } from './catalogId.js';
import { mapIndex } from './mapIndex.js';

describe('isCatalogId', () => {
  it('takes five uppercase letters or digits with a letter', () => {
    expect(isCatalogId('Z0001')).toBe(true);

    expect(isCatalogId('12345')).toBe(false);

    expect(isCatalogId('z0001')).toBe(false);

    expect(isCatalogId('Z00001')).toBe(false);
  });

  it('never takes a built-in id', () => {
    expect(mapIndex.filter(({ type }) => isCatalogId(type))).toEqual([]);
  });
});
