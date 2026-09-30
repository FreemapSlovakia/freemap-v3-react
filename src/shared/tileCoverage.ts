import { useEffect, useSyncExternalStore } from 'react';
import { tileRangesInBbox } from './tileEnumeration.js';

export type TileCover = 'full' | 'partial' | 'none';

/** How far a tile at (z, x, y) — in URL zoom — has data. */
export type TileCoverage = (z: number, x: number, y: number) => TileCover;

/** Covers everything partially: every tile of both sources is fetched. */
export const unknownCoverage: TileCoverage = () => 'partial';

const FORMAT_VERSION = 1;

const COVERAGE_TIMEOUT_MS = 5000;

const cache = new Map<string, Promise<TileCoverage>>();

/** Coverages loaded so far; replaced, not mutated, so it can be a store snapshot. */
let loaded: ReadonlyMap<string, TileCoverage> = new Map();

const listeners = new Set<() => void>();

const failing = new Set<string>();

/** Whether the last load of `url` failed, so a new consumer need not wait for a retry. */
export const coverageFailing = (url: string): boolean => failing.has(url);

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * The coverages of `urls` that have loaded, keyed by URL; a missing one is not
 * known (yet), so both sources should be assumed.
 */
export function useTileCoverages(
  urls: readonly string[],
): ReadonlyMap<string, TileCoverage> {
  const key = urls.join('\n');

  useEffect(() => {
    for (const url of key ? key.split('\n') : []) {
      void loadTileCoverage(url);
    }
  }, [key]);

  return useSyncExternalStore(subscribe, () => loaded);
}

/** Which kinds of coverage the tiles intersecting `bounds` at `zoom` have. */
export function coversInBounds(
  coverage: TileCoverage,
  bounds: [number, number, number, number],
  zoom: number,
): Set<TileCover> {
  const [{ minX, maxX, minY, maxY }] = tileRangesInBbox(bounds, zoom, zoom);

  const covers = new Set<TileCover>();

  for (let x = minX; x <= maxX && covers.size < 3; x++) {
    for (let y = minY; y <= maxY; y++) {
      covers.add(coverage(zoom, x, y));
    }
  }

  return covers;
}

/**
 * Coverage served by the ortofoto tileserver's `/coverage.bin`. A failed load
 * resolves to `unknownCoverage` and is retried on the next call.
 */
export function loadTileCoverage(url: string): Promise<TileCoverage> {
  let promise = cache.get(url);

  if (!promise) {
    // the base map waits for it, so a hanging server must not keep it blank
    promise = fetch(url, { signal: AbortSignal.timeout(COVERAGE_TIMEOUT_MS) })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`coverage ${res.status}`);
        }

        return res.arrayBuffer();
      })
      .then((buffer) => {
        const coverage = decodeTileCoverage(new Uint8Array(buffer));

        failing.delete(url);

        loaded = new Map([...loaded, [url, coverage]]);

        for (const listener of listeners) {
          listener();
        }

        return coverage;
      })
      .catch((err) => {
        console.warn('Tile coverage unavailable:', err);

        failing.add(url);

        cache.delete(url);

        return unknownCoverage;
      });

    cache.set(url, promise);
  }

  return promise;
}

/**
 * `[version, maxZoom]`, then a quadtree from the z0 tile, depth first, 2 bits
 * per node packed most significant first: 00 none, 01 full, 10 partial followed
 * by its children (2x, 2y), (2x+1, 2y), (2x, 2y+1), (2x+1, 2y+1) unless at
 * `maxZoom`, 11 partial with nothing known below, so its subtree is partial.
 */
export function decodeTileCoverage(data: Uint8Array): TileCoverage {
  if (data[0] !== FORMAT_VERSION) {
    throw new Error(`unsupported coverage version ${data[0]}`);
  }

  const maxZoom = data[1];

  if (maxZoom === undefined || maxZoom > 20) {
    throw new Error('invalid coverage zoom');
  }

  // per zoom, the tiles that are partial; a full or unknown node covers its subtree
  const partial: Set<number>[] = [];

  const full: Set<number>[] = [];

  const unknown: Set<number>[] = [];

  for (let z = 0; z <= maxZoom; z++) {
    partial.push(new Set());

    full.push(new Set());

    unknown.push(new Set());
  }

  // x and y stay below 2^20, so both fit one safe integer
  const key = (x: number, y: number) => x * 2 ** 20 + y;

  let pos = 0;

  const next = () => {
    const byte = data[2 + (pos >> 2)];

    if (byte === undefined) {
      throw new Error('truncated coverage');
    }

    const code = (byte >> (6 - 2 * (pos & 3))) & 3;

    pos++;

    return code;
  };

  const read = (z: number, x: number, y: number) => {
    const code = next();

    if (code === 1) {
      full[z].add(key(x, y));
    } else if (code === 3) {
      unknown[z].add(key(x, y));
    } else if (code === 2) {
      partial[z].add(key(x, y));

      if (z < maxZoom) {
        read(z + 1, 2 * x, 2 * y);
        read(z + 1, 2 * x + 1, 2 * y);
        read(z + 1, 2 * x, 2 * y + 1);
        read(z + 1, 2 * x + 1, 2 * y + 1);
      }
    }
  };

  read(0, 0, 0);

  return (z, x, y) => {
    const deepest = Math.min(z, maxZoom);

    for (let level = deepest; level >= 0; level--) {
      const shift = z - level;

      const k = key(x >> shift, y >> shift);

      if (full[level].has(k)) {
        return 'full';
      }

      if (unknown[level].has(k)) {
        return 'partial';
      }

      // An ancestor that is partial had its children written, so the one on
      // this tile's path was none.
      if (partial[level].has(k)) {
        return level === deepest ? 'partial' : 'none';
      }
    }

    return 'none';
  };
}
