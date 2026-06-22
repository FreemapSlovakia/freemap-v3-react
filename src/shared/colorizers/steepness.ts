import { smoothElevations } from '@shared/geoutils.js';
import { distance } from '@turf/distance';
import { getCoords } from '@turf/invariant';
import type { Colorizer } from './types.js';

const SMOOTHING = 5;

// Grade is measured over at least this horizontal span rather than between
// adjacent vertices. Dense router shape points at a sharp bend are only metres
// apart, so dividing a coarse-DEM rise by that near-zero run reads as a cliff;
// a fixed baseline removes those spikes and low-pass-filters toward the DEM's
// real (~30 m) resolution.
const BASELINE_METERS = 30;

export const steepnessColorizer: Colorizer = {
  needsElevation: true,
  palette: [
    { r: 0, g: 255, b: 0, t: 0.0 },
    { r: 255, g: 255, b: 255, t: 0.5 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  compute: (features) =>
    features.map((feature) => {
      const coords = getCoords(feature);

      const smoothed = smoothElevations(coords, SMOOTHING);

      // Cumulative horizontal distance so a slope can be taken over a fixed
      // span regardless of how densely the vertices are spaced.
      const cum: number[] = [0];

      for (let i = 1; i < smoothed.length; i++) {
        cum[i] =
          cum[i - 1]! +
          distance(smoothed[i - 1]!, smoothed[i]!, { units: 'meters' });
      }

      const total = cum[cum.length - 1] ?? 0;

      const span = Math.min(BASELINE_METERS, total);

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
