import { pointToTile, tileToGeoJSON } from '@mapbox/tilebelt';
import bbox from '@turf/bbox';
import { booleanIntersects } from '@turf/boolean-intersects';
import type { Feature, Polygon } from 'geojson';

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

export function countTilesInPolygon(
  poly: Feature<Polygon>,
  minZoom: number,
  maxZoom: number,
): number {
  const bboxExtent = bbox(poly);

  let count = 0;

  for (let z = minZoom; z <= maxZoom; z++) {
    const minTile = pointToTile(bboxExtent[0], bboxExtent[3], z);
    const maxTile = pointToTile(bboxExtent[2], bboxExtent[1], z);

    for (let x = minTile[0]; x <= maxTile[0]; x++) {
      for (let y = minTile[1]; y <= maxTile[1]; y++) {
        if (booleanIntersects(poly, tileToGeoJSON([x, y, z]))) {
          count++;
        }
      }
    }
  }

  return count;
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

export function* enumerateTilesInPolygon(
  poly: Feature<Polygon>,
  minZoom: number,
  maxZoom: number,
): Generator<TileCoord> {
  const bboxExtent = bbox(poly);

  for (let z = minZoom; z <= maxZoom; z++) {
    const minTile = pointToTile(bboxExtent[0], bboxExtent[3], z);
    const maxTile = pointToTile(bboxExtent[2], bboxExtent[1], z);

    for (let x = minTile[0]; x <= maxTile[0]; x++) {
      for (let y = minTile[1]; y <= maxTile[1]; y++) {
        if (booleanIntersects(poly, tileToGeoJSON([x, y, z]))) {
          yield [x, y, z];
        }
      }
    }
  }
}
