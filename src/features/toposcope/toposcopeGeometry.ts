import type { LatLon } from '@shared/types/common.js';
import { bearing } from '@turf/bearing';
import { distance } from '@turf/distance';

/** Compass bearing from the observer to a point, degrees clockwise from north. */
export function bearingTo(from: LatLon, to: LatLon): number {
  return (bearing([from.lon, from.lat], [to.lon, to.lat]) + 360) % 360;
}

/** Great-circle distance in metres. */
export function distanceTo(from: LatLon, to: LatLon): number {
  return distance([from.lon, from.lat], [to.lon, to.lat], { units: 'meters' });
}

/**
 * Where a bearing lands on the dial, in the SVG's user units: the toposcope is
 * drawn north-up, and SVG's y grows downward.
 */
export function dialPoint(
  bearingDeg: number,
  radius: number,
): [x: number, y: number] {
  const rad = (bearingDeg * Math.PI) / 180;

  return [Math.sin(rad) * radius, -Math.cos(rad) * radius];
}

/**
 * Whether a label laid along a ray reads upside down. Text runs outward from
 * the centre, so it is upright only while the ray points into the eastern half
 * of the dial; reversing the ray's path turns the rest the right way up.
 */
export function readsUpsideDown(bearingDeg: number): boolean {
  return bearingDeg >= 180;
}
