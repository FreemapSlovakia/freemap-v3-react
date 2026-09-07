import {
  cumulativeDistances,
  DEM_RESOLUTION_METERS,
  smoothElevations,
} from '@shared/geoutils.js';
import { getCoords } from '@turf/invariant';
import type { Colorizer } from '../colorize.js';
import { featureSmoothingSpan } from '../smoothing.js';

// Grade is measured over a fixed horizontal span rather than between adjacent
// vertices. Dense router shape points at a sharp bend are only metres apart, so
// dividing a coarse-DEM rise by that near-zero run reads as a cliff; a fixed
// baseline removes those spikes and low-pass-filters toward the DEM's
// resolution.
const BASELINE_METERS = DEM_RESOLUTION_METERS;

/**
 * The grades the ends of the palette can be set to, as ratios: the scale runs
 * from `-scale` to `+scale` and clamps beyond. No one value serves every route
 * — measured against real ones, the widest scale that clamps almost nothing is
 * 5 % for a road ride, 15 % for a car, 25 % on rolling hills and 60 % in the
 * Tatras — so the reader picks, and each of these is somebody's best fit.
 */
export const STEEPNESS_SCALES = [0.05, 0.1, 0.15, 0.25, 0.4, 0.6, 1] as const;

/** 100 % is 45°, past which nobody is walking, so it clamps nothing anywhere. */
export const STEEPNESS_DEFAULT_SCALE = 1;

/**
 * Where the scale stops being straight: grades under this keep their spacing,
 * past it the palette compresses. Both ends have to fit one ramp — an alpine
 * path reaches 50 %, a road route's whole range is a couple of per cent and was
 * one black line. Measured over real routes, 1 % is what makes a gentle ride
 * legible without painting the terrain model's own noise.
 */
const STEEPNESS_KNEE = 0.01;

const fullScaleT = (scale: number) => Math.asinh(scale / STEEPNESS_KNEE);

/**
 * A grade as its place in the palette, 0…1 with 0.5 flat. `asinh` rather than a
 * plain log because grade is signed and crosses zero: it is odd-symmetric,
 * defined at 0, and straight either side of it.
 */
export function steepnessColor(
  grade: number,
  scale: number = STEEPNESS_DEFAULT_SCALE,
): number {
  return Number.isFinite(grade)
    ? Math.max(
        0,
        Math.min(
          1,
          0.5 + (0.5 * Math.asinh(grade / STEEPNESS_KNEE)) / fullScaleT(scale),
        ),
      )
    : 0.5;
}

/**
 * The grade a palette position stands for. The legend labels itself through
 * this, so the colored line and the labels can't drift apart.
 */
export function steepnessGradeAt(
  t: number,
  scale: number = STEEPNESS_DEFAULT_SCALE,
): number {
  return STEEPNESS_KNEE * Math.sinh((2 * t - 1) * fullScaleT(scale));
}

export const steepnessColorizer: Colorizer = {
  needsElevation: true,
  palette: [
    { r: 0, g: 255, b: 255, t: 0.0 },
    { r: 0, g: 255, b: 0, t: 0.25 },
    { r: 0, g: 0, b: 0, t: 0.5 },
    { r: 255, g: 0, b: 0, t: 0.75 },
    { r: 255, g: 0, b: 255, t: 1.0 },
  ],
  compute: (features, options) =>
    features.map((feature) => {
      const coords = getCoords(feature);

      // Both the elevation denoising and the grade baseline widen with zoom-out
      // so the colored line generalizes at small scales instead of showing
      // sub-pixel grade wiggle.
      const baseline = featureSmoothingSpan(BASELINE_METERS, coords, options);

      const smoothed = smoothElevations(coords, baseline);

      // Slope is taken over a fixed span regardless of how densely the vertices
      // are spaced; the inward-shifting window below keeps that span constant.
      const cum = cumulativeDistances(smoothed);

      const total = cum[cum.length - 1] ?? 0;

      const span = Math.min(baseline, total);

      return smoothed.map((coord, i) => {
        const [lon, lat] = coord;

        // Center a fixed-length window on the point, shifting it inward at the
        // ends so the grade is always taken over the same span instead of a
        // collapsing (and noisy) near-zero run.
        let lo = cum[i]! - span / 2;

        let hi = cum[i]! + span / 2;

        if (lo < 0) {
          hi -= lo;
          lo = 0;
        }

        if (hi > total) {
          lo -= hi - total;
          hi = total;
        }

        lo = Math.max(0, lo);

        let j = i;

        while (j > 0 && cum[j]! > lo) {
          j--;
        }

        let k = i;

        while (k < smoothed.length - 1 && cum[k]! < hi) {
          k++;
        }

        const run = cum[k]! - cum[j]!;

        const angle = run > 0 ? (smoothed[k]![2]! - smoothed[j]![2]!) / run : 0;

        // Smoothing carries a value forward across holes, so a gap is decided
        // from the original coordinate, not the smoothed one.
        const gap = !(coords[i]!.length >= 3 && Number.isFinite(coords[i]![2]));

        return {
          lat: lat!,
          lon: lon!,
          color: steepnessColor(angle, options?.steepnessScale),
          gap,
        };
      });
    }),
};
