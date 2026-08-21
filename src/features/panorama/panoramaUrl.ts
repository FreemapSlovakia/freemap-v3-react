import type { LatLon } from '@shared/types/common.js';
import type { PanoramaSettingsState } from './model/settingsReducer.js';
import { PANORAMA_TILTS, type PanoramaTilt } from './quality.js';

/** Digits `panorama=` is written with, which is also what it is compared at. */
const COORD_DIGITS = 6;

/**
 * `panorama=lat,lon` — where the picture is taken from. The picture itself is
 * not in the link: arriving with a viewpoint renders it again.
 *
 * Codec and parser sit together because they have to agree exactly: the
 * viewpoint is compared at the precision it is written with, so that stepping
 * through the history doesn't pay for a render on every step.
 */
export function serializePanoramaViewpoint({ lat, lon }: LatLon): string {
  return `${lat.toFixed(COORD_DIGITS)},${lon.toFixed(COORD_DIGITS)}`;
}

export function parsePanoramaViewpoint(param: string): LatLon | null {
  const parts = param.split(',');

  // Every component read, and the range checked: an empty one reads as `0`, so
  // `panorama=,` would otherwise render Null Island, and a junk link would cost
  // several seconds of somebody else's server before the service refused it.
  if (parts.length !== 2 || parts.some((p) => !p.trim())) {
    return null;
  }

  const [lat, lon] = parts.map(Number) as [number, number];

  return Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
    ? { lat, lon }
    : null;
}

/**
 * `panorama-tilt=` — the vertical band the picture frames, since it decides
 * what the picture holds. A preset by name, a custom band as its two angles.
 */
export function serializePanoramaTilt({
  tilt,
  altMin,
  altMax,
}: PanoramaSettingsState): string {
  return tilt === 'custom' ? `${altMin},${altMax}` : tilt;
}

/**
 * The settings a `panorama-tilt=` asks for, or `null` if it says nothing. A
 * preset carries no angles of its own — `tiltRange` resolves them from the
 * name, and leaving the stored pair alone keeps whatever custom band the user
 * had set to return to.
 */
export function parsePanoramaTilt(
  param: string,
): Partial<PanoramaSettingsState> | null {
  const [altMin, altMax] = param.split(',').map(Number);

  if (
    altMin !== undefined &&
    altMax !== undefined &&
    Number.isFinite(altMin) &&
    Number.isFinite(altMax) &&
    altMax > altMin
  ) {
    return { tilt: 'custom', altMin, altMax };
  }

  // `hasOwn`, not `in`: `panorama-tilt=toString` would otherwise name a
  // function as the band, and `tiltRange` would hand the request a `NaN` step.
  return Object.hasOwn(PANORAMA_TILTS, param)
    ? { tilt: param as PanoramaTilt }
    : null;
}
