/** Rounded-up highest elevation (in metres) covered by each parametric-shading layer. */
const OVERLAY_MAX_ELEVATION: Partial<Record<string, number>> = {
  h: 5650, // GEDTM30 reaches the Caucasus — Elbrus 5642 m
};

/** Highest elevation any active parametric-shading overlay can show; 4900 m when none is active. */
const FALLBACK_MAX_ELEVATION = 4900;

/**
 * Returns the elevation (in metres) the color-relief gradient should span,
 * taken as the maximum over the active map layers. Multiple shading overlays
 * can be active at once, so the largest applicable value wins.
 */
export function colorReliefMaxElevation(layers: readonly string[]): number {
  const maxima = layers
    .map((layer) => OVERLAY_MAX_ELEVATION[layer])
    .filter((value): value is number => value !== undefined);

  return maxima.length ? Math.max(...maxima) : FALLBACK_MAX_ELEVATION;
}
