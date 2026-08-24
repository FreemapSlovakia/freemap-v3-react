import type { LatLon } from '@shared/types/common.js';
import { VIEWSHED_RADIUS_STEPS_KM } from './model/settingsReducer.js';

/** Digits `viewshed=` is written with, which is also what it is compared at. */
const COORD_DIGITS = 6;

/**
 * `viewshed=lat,lon,radiusKm` — where one stands and how far it looks. The
 * overlay itself is not in the link: arriving with a viewpoint renders it again.
 */
export function serializeViewshed(
  { lat, lon }: LatLon,
  radiusKm: number,
): string {
  return `${lat.toFixed(COORD_DIGITS)},${lon.toFixed(COORD_DIGITS)},${radiusKm}`;
}

/**
 * Whether two viewpoints are the same place *as the link writes them*: compared
 * at the digits it rounds to, or stepping through the history would pay for a
 * render on every step.
 */
export function sameViewpoint(a: LatLon, b: LatLon): boolean {
  return (
    a.lat.toFixed(COORD_DIGITS) === b.lat.toFixed(COORD_DIGITS) &&
    a.lon.toFixed(COORD_DIGITS) === b.lon.toFixed(COORD_DIGITS)
  );
}

export type ParsedViewshed = { viewpoint: LatLon; radiusKm?: number };

export function parseViewshed(param: string): ParsedViewshed | null {
  const parts = param.split(',');

  // Every component read, and the range checked: an empty one reads as `0`, so
  // `viewshed=,` would otherwise render Null Island, and a junk link would cost
  // several seconds of somebody else's server before the service refused it.
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !p.trim())) {
    return null;
  }

  const [lat, lon, radiusKm] = parts.map(Number) as [number, number, number?];

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return null;
  }

  return {
    viewpoint: { lat, lon },
    // Only a radius the control can be moved back to: the request is built from
    // whatever this says, and the service charges rays for it.
    ...(radiusKm !== undefined && VIEWSHED_RADIUS_STEPS_KM.includes(radiusKm)
      ? { radiusKm }
      : {}),
  };
}
