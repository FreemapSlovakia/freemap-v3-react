import { area } from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import { length } from '@turf/length';
import type { Position } from 'geojson';

/** Square metres enclosed, holes taken off; none while still being drawn. */
export function ringsArea(rings: Position[][]): number {
  // turf throws on a ring of fewer than three points (four closed).
  return (rings[0]?.length ?? 0) < 4 ? 0 : area(polygon(rings, {}));
}

/** Metres around, every ring counted. */
export function ringsPerimeter(rings: Position[][]): number {
  return rings.reduce(
    (sum, ring) => sum + length(lineString(ring), { units: 'meters' }),
    0,
  );
}
