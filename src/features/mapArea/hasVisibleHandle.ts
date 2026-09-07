import { insetBbox } from './insetBbox.js';
import type { Bbox } from './model/actions.js';

/**
 * Tell whether any of the rectangle's drag handles — its 4 corners, its 4 edge
 * midpoints or its center move handle — lies within the viewport, shrunk by
 * `buffer` so a handle glued to the very edge of the screen doesn't count.
 *
 * Handle points rather than a plain bbox intersection: an area swallowing the
 * whole viewport does intersect it, yet offers nothing to grab.
 */
export function hasVisibleHandle(
  [w, s, e, n]: Bbox,
  viewport: Bbox,
  buffer = 0.1,
): boolean {
  const [vw, vs, ve, vn] = insetBbox(viewport, buffer);

  const lngs = [w, (w + e) / 2, e];

  const lats = [s, (s + n) / 2, n];

  return (
    lngs.some((lng) => lng >= vw && lng <= ve) &&
    lats.some((lat) => lat >= vs && lat <= vn)
  );
}
