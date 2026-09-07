import { area } from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import { length } from '@turf/length';
import type { Position } from 'geojson';
import type {
  DrawnLine,
  Line,
  Point,
} from './model/actions/drawingLineActions.js';

/**
 * The rings a shape is measured as. A polygon's holes belong to it, so they
 * come off its area and their outlines count towards its perimeter; a hole
 * measured on its own is just its own ring.
 *
 * Shared by the measurement readout and by the `{area_*}` / `{perimeter_*}`
 * label placeholders — a label that disagreed with the readout a centimetre
 * above it would read as a bug in both.
 */
export function measuredRings(
  line: Pick<DrawnLine, 'id' | 'points' | 'holeOfId'>,
  lines: readonly Pick<DrawnLine, 'id' | 'points' | 'holeOfId'>[],
): Position[][] {
  return [
    line.points,
    ...(line.holeOfId === undefined
      ? lines
          .filter((l) => l.holeOfId === line.id && l.points.length > 2)
          .map((l) => l.points)
      : []),
  ].map(closedRing);
}

function closedRing(ring: readonly Point[]): Position[] {
  return [...ring, ring[0]!].map((point) => [point.lon, point.lat]);
}

/** Square metres enclosed, holes already taken off. */
export function ringsArea(rings: Position[][]): number {
  return area(polygon(rings, {}));
}

/** Metres around, every ring counted. */
export function ringsPerimeter(rings: Position[][]): number {
  return rings.reduce(
    (sum, ring) => sum + length(lineString(ring), { units: 'meters' }),
    0,
  );
}

/** Metres along an open line. */
export function lineLength(line: Pick<Line, 'points'>): number {
  return line.points.length < 2
    ? 0
    : length(lineString(line.points.map((point) => [point.lon, point.lat])), {
        units: 'meters',
      });
}
