import { describe, expect, it } from 'vitest';
import {
  KEEP,
  keyOf,
  parseKey,
  type StoredKey,
  staleKeys,
} from './mapStore.js';

/**
 * The pure half of the working-copy store: what a key means, and which keys a
 * prune drops. The IndexedDB calls around them are thin, so this is where the
 * decisions worth pinning live.
 */

const at = (mapId: string, updatedAt: number): StoredKey => ({
  key: keyOf(mapId, updatedAt),
  mapId,
  updatedAt,
});

describe('working-copy keys', () => {
  it('round-trips a map id and the time it was touched', () => {
    expect(parseKey(keyOf('abc', 1700))).toEqual({
      key: 'map:1700:abc',
      mapId: 'abc',
      updatedAt: 1700,
    });
  });

  // The timestamp is read up to the *first* separator, so everything after it is
  // the id however many separators it holds.
  it('round-trips a map id containing the separator', () => {
    expect(parseKey(keyOf('a:b:c', 42))?.mapId).toBe('a:b:c');
  });

  it('ignores anything that is not a record key', () => {
    expect(parseKey('index')).toBeUndefined();

    expect(parseKey('map:notatime:abc')).toBeUndefined();

    expect(parseKey('map:123')).toBeUndefined();

    expect(parseKey(42)).toBeUndefined();
  });
});

describe('staleKeys', () => {
  it('drops nothing while every map has one record and there is room', () => {
    expect(staleKeys([at('a', 3), at('b', 2)])).toEqual([]);
  });

  it('keeps only the newest record of a map', () => {
    expect(staleKeys([at('a', 1), at('a', 3), at('a', 2)])).toEqual([
      keyOf('a', 1),
      keyOf('a', 2),
    ]);
  });

  it('keeps the newest whichever order the keys arrive in', () => {
    expect(staleKeys([at('a', 3), at('a', 1)])).toEqual([keyOf('a', 1)]);
  });

  it('drops the least recently touched maps past the limit', () => {
    const entries = Array.from({ length: KEEP + 2 }, (_, i) =>
      at(`m${i}`, i + 1),
    );

    // The two oldest — `m0` and `m1` — are the ones over the limit.
    expect(staleKeys(entries).sort()).toEqual(
      [keyOf('m0', 1), keyOf('m1', 2)].sort(),
    );
  });

  it('counts a map once when it has superseded records', () => {
    const entries = [
      ...Array.from({ length: KEEP }, (_, i) => at(`m${i}`, i + 1)),
      // An extra record of a map already counted must not evict another map.
      at('m0', 100),
    ];

    expect(staleKeys(entries)).toEqual([keyOf('m0', 1)]);
  });
});
