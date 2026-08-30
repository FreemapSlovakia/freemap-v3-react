import { metersPerPixel } from '@shared/geoutils.js';
import type { ColorizeOptions } from './colorize.js';

// Value-smoothing windows are widened to span at least this many screen pixels:
// when zoomed out, detail finer than a few pixels can't be seen and only reads
// as color noise, so it's averaged away. At high zoom the colorizer's own
// baseline span is larger and dominates, keeping full detail.
const SMOOTH_PX = 16;

/**
 * Effective smoothing span (metres): the larger of a colorizer's intrinsic
 * `baseMeters` baseline and {@link SMOOTH_PX} pixels' worth of line. The reader
 * says how much line a pixel is worth, either directly or as a map zoom; saying
 * neither leaves the baseline untouched.
 */
function zoomSmoothingSpan(
  baseMeters: number,
  options: ColorizeOptions | undefined,
  lat: number,
): number {
  const perPixel =
    options?.metersPerPixel ??
    (options?.zoom === undefined
      ? undefined
      : metersPerPixel(options.zoom, lat));

  return perPixel === undefined
    ? baseMeters
    : Math.max(baseMeters, SMOOTH_PX * perPixel);
}

/**
 * Smoothing span for a feature whose vertices are `coords` ([lon, lat, …]).
 * Where the scale comes from a map zoom, the pixel↔metre conversion is taken at
 * the feature's own mid-latitude — the track is drawn at that latitude's
 * Web-Mercator scale, so that (not the map centre) is what makes the window a
 * fixed pixel size on screen. The single mid-latitude also keeps the span stable
 * under panning, so the per-zoom colorize cache holds. A reader stating
 * `metersPerPixel` needs none of this and is taken at its word.
 */
export function featureSmoothingSpan(
  baseMeters: number,
  coords: number[][],
  options: ColorizeOptions | undefined,
): number {
  const lat = ((coords[0]?.[1] ?? 0) + (coords.at(-1)?.[1] ?? 0)) / 2;

  return zoomSmoothingSpan(baseMeters, options, lat);
}
