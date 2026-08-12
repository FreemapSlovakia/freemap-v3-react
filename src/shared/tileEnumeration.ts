import { pointToTile } from '@mapbox/tilebelt';

export type TileCoord = [x: number, y: number, z: number];

export type TileRange = {
  zoom: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  count: number;
};

/** The tile rectangle covering `bounds` at every zoom of the range. */
export function tileRangesInBbox(
  bounds: [number, number, number, number],
  minZoom: number,
  maxZoom: number,
): TileRange[] {
  const ranges: TileRange[] = [];

  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const from = pointToTile(bounds[0], bounds[1], zoom);
    const to = pointToTile(bounds[2], bounds[3], zoom);

    ranges.push({
      zoom,
      minX: from[0],
      maxX: to[0],
      minY: to[1],
      maxY: from[1],
      count: (to[0] - from[0] + 1) * (from[1] - to[1] + 1),
    });
  }

  return ranges;
}

export function countTilesInBbox(
  bounds: [number, number, number, number],
  minZoom: number,
  maxZoom: number,
): number {
  const count = tileRangesInBbox(bounds, minZoom, maxZoom).reduce(
    (sum, range) => sum + range.count,
    0,
  );

  return count > 1_000_000_000 ? Infinity : count;
}

/** An area × zoom range, as a cached offline map covers it. */
export type TileCoverage = {
  bounds: [number, number, number, number];
  minZoom: number;
  maxZoom: number;
};

/** The coverage's tile rectangles keyed by zoom, for membership tests. */
export function tileRangeIndex(coverage: TileCoverage): Map<number, TileRange> {
  return new Map(
    tileRangesInBbox(coverage.bounds, coverage.minZoom, coverage.maxZoom).map(
      (range) => [range.zoom, range],
    ),
  );
}

export function coverageContains(
  index: Map<number, TileRange>,
  [x, y, z]: TileCoord,
): boolean {
  const range = index.get(z);

  if (!range) {
    return false;
  }

  return (
    x >= range.minX && x <= range.maxX && y >= range.minY && y <= range.maxY
  );
}

/** Whether `outer` takes in every tile `inner` covers. */
export function coverageIncludes(
  outer: TileCoverage,
  inner: TileCoverage,
): boolean {
  const index = tileRangeIndex(outer);

  return tileRangesInBbox(inner.bounds, inner.minZoom, inner.maxZoom).every(
    (range) => {
      const other = index.get(range.zoom);

      if (!other) {
        return false;
      }

      return (
        range.minX >= other.minX &&
        range.maxX <= other.maxX &&
        range.minY >= other.minY &&
        range.maxY <= other.maxY
      );
    },
  );
}

/**
 * How many of `next`'s tiles a download of `prev` that got through its first
 * `count` tiles already holds. Which tiles those are is known because a
 * download always visits them in `enumerateTilesInBbox` order — zoom by zoom,
 * then column by column — so the part of each zoom it reached is a number of
 * whole columns plus at most one partial one. The result can never exceed the
 * tile count of either coverage.
 *
 * An estimate, not a fact: it assumes the tiles held are the first `count` of
 * `prev`'s order, which a map that was already extended once and interrupted
 * doesn't satisfy — it holds a scattered set instead. Good enough to size a
 * download with; anything recorded as a map's own count is measured against the
 * cache instead.
 */
export function countCachedOf(
  prev: TileCoverage,
  next: TileCoverage,
  count: number,
): number {
  const nextIndex = tileRangeIndex(next);

  let remaining = count;
  let total = 0;

  for (const range of tileRangesInBbox(
    prev.bounds,
    prev.minZoom,
    prev.maxZoom,
  )) {
    if (remaining <= 0) {
      break;
    }

    const taken = Math.min(remaining, range.count);

    remaining -= taken;

    const other = nextIndex.get(range.zoom);

    if (!other) {
      continue;
    }

    const spanX = (from: number, to: number) =>
      Math.max(0, Math.min(to, other.maxX) - Math.max(from, other.minX) + 1);

    const spanY = (from: number, to: number) =>
      Math.max(0, Math.min(to, other.maxY) - Math.max(from, other.minY) + 1);

    const height = range.maxY - range.minY + 1;

    const wholeColumns = Math.floor(taken / height);

    total +=
      spanX(range.minX, range.minX + wholeColumns - 1) *
      spanY(range.minY, range.maxY);

    const partial = taken % height;

    if (partial > 0) {
      const x = range.minX + wholeColumns;

      total += spanX(x, x) * spanY(range.minY, range.minY + partial - 1);
    }
  }

  return total;
}

export function* enumerateTilesInBbox(
  bounds: [number, number, number, number],
  minZoom: number,
  maxZoom: number,
): Generator<TileCoord> {
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const from = pointToTile(bounds[0], bounds[1], zoom);
    const to = pointToTile(bounds[2], bounds[3], zoom);

    for (let x = from[0]; x <= to[0]; x++) {
      for (let y = to[1]; y <= from[1]; y++) {
        yield [x, y, zoom];
      }
    }
  }
}
