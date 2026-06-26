import { metersPerPixel } from '@shared/geoutils.js';
import type { ColorizeOptions } from './colorize.js';

// Value-smoothing windows are widened to span at least this many screen pixels:
// when zoomed out, detail finer than a few pixels can't be seen and only reads
// as color noise, so it's averaged away. At high zoom the colorizer's own
// baseline span is larger and dominates, keeping full detail.
const SMOOTH_PX = 32;

/**
 * Effective smoothing span (metres): the larger of a colorizer's intrinsic
 * `baseMeters` baseline and {@link SMOOTH_PX} pixels of ground distance at the
 * current zoom. `zoom` undefined leaves the baseline untouched.
 */
function zoomSmoothingSpan(
  baseMeters: number,
  zoom: number | undefined,
  lat: number,
): number {
  return zoom === undefined
    ? baseMeters
    : Math.max(baseMeters, SMOOTH_PX * metersPerPixel(zoom, lat));
}

/**
 * Smoothing span for a feature whose vertices are `coords` ([lon, lat, …]).
 * The pixel↔metre scale is taken at the feature's own mid-latitude — the track
 * is drawn at that latitude's Web-Mercator scale, so that (not the map centre)
 * is what makes the window a fixed pixel size on screen. The single mid-latitude
 * also keeps the span stable under panning, so the per-zoom colorize cache holds.
 */
export function featureSmoothingSpan(
  baseMeters: number,
  coords: number[][],
  options: ColorizeOptions | undefined,
): number {
  const lat = ((coords[0]?.[1] ?? 0) + (coords.at(-1)?.[1] ?? 0)) / 2;

  return zoomSmoothingSpan(baseMeters, options?.zoom, lat);
}
