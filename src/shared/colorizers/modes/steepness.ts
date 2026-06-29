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

        const color = Number.isFinite(angle)
          ? Math.max(0, Math.min(1, angle / 0.5 + 0.5))
          : 0.5;

        return { lat: lat!, lon: lon!, color, gap };
      });
    }),
};
