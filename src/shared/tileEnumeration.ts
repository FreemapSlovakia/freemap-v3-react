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
