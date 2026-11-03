/** How many steps the map layers go darker, and how many lighter. */
export const BRIGHTNESS_STEPS = 8;

/** At the darkest step, white is dimmed to `1 - MAX_DARKEN`. */
const MAX_DARKEN = 0.8;

/** At the lightest step, black is raised to `MAX_LIGHTEN`; white stays. */
const MAX_LIGHTEN = 0.8;

/**
 * The CSS filter of the map layers at a brightness step. Each step scales by
 * the same ratio rather than the same amount, as the eye sees ratios.
 */
export function brightnessFilter(step: number): string {
  const t = Math.abs(step) / BRIGHTNESS_STEPS;

  if (step < 0) {
    return `brightness(${(1 - MAX_DARKEN) ** t})`;
  }

  if (step > 0) {
    // Mixed with white by `a`, x → a + (1 − a)·x; what is left of black's
    // darkness, 1 − a, shrinks by equal ratios.
    const a = 1 - (1 - MAX_LIGHTEN) ** t;

    return `contrast(${(1 - a) / (1 + a)}) brightness(${1 + a})`;
  }

  return '';
}
