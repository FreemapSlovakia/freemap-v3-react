import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';
import type { ColorizedPoint, Colorizer } from './colorize.js';

/**
 * Colorize `features` at the current integer `zoom`, memoizing the result per
 * zoom so panning and unrelated re-renders don't recompute and revisiting a
 * zoom is instant. The cache is keyed only by zoom and reset whenever the
 * `colorizer` or `features` reference changes — pass a stable (memoized)
 * `features` array so the cache survives across renders.
 */
export function useZoomColorize(
  colorizer: Colorizer | null,
  features: Feature<LineString>[],
  zoom: number,
): ColorizedPoint[][] {
  // Reset the per-zoom cache whenever the inputs it colorizes change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: colorizer/features are intentional cache-reset keys
  const cache = useMemo(
    () => new Map<number, ColorizedPoint[][]>(),
    [colorizer, features],
  );

  // Round so a transient fractional zoom (e.g. mid-gesture, or a future
  // zoomSnap < 1) can't spawn an unbounded set of near-duplicate cache entries
  // that never hit; smoothing at the nearest integer zoom is indistinguishable.
  const z = Math.round(zoom);

  return useMemo(() => {
    if (!colorizer || features.length === 0) {
      return [];
    }

    const hit = cache.get(z);

    if (hit) {
      return hit;
    }

    const result = colorizer.compute(features, { zoom: z });

    cache.set(z, result);

    return result;
  }, [cache, colorizer, features, z]);
}
