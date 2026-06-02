import { pointToTile } from '@mapbox/tilebelt';

export type TileCoord = [x: number, y: number, z: number];

export function countTilesInBbox(
  bounds: [number, number, number, number],
  minZoom: number,
  maxZoom: number,
): number {
  let count = 0;

  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const from = pointToTile(bounds[0], bounds[1], zoom);
    const to = pointToTile(bounds[2], bounds[3], zoom);

    count += (to[0] - from[0] + 1) * (from[1] - to[1] + 1);
  }

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
