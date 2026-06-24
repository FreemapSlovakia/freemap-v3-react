import { cumulativeDistances, metricWindow } from '@shared/geoutils.js';
import { getCoords } from '@turf/invariant';
import type { Feature, LineString } from 'geojson';
import { type Colorizer, colorizeByValues } from '../colorize.js';
import { featureSmoothingSpan } from '../smoothing.js';

// Speed is averaged over this horizontal span to absorb GPS jitter and
// quantized timestamps; a single short segment can otherwise read as a spike.
const SMOOTHING_METERS = 50;

function getTimes(
  feature: Feature<LineString>,
  expectedLength: number,
): number[] | null {
  const raw = feature.properties?.['coordTimes'];

  if (!Array.isArray(raw) || raw.length !== expectedLength) {
    return null;
  }

  return raw.map((t) => (typeof t === 'string' ? new Date(t).getTime() : NaN));
}

export const speedColorizer: Colorizer = {
  palette: [
    { r: 0, g: 0, b: 255, t: 0.0 },
    { r: 0, g: 255, b: 0, t: 0.5 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  isAvailable: (features) =>
    features.some((f) => {
      const coords = f.geometry.coordinates;

      return getTimes(f, coords.length) !== null;
    }),
  compute: (features, options) =>
    colorizeByValues(features, (feature) => {
      const coords = getCoords(feature);

      const times = getTimes(feature, coords.length);

      const cum = cumulativeDistances(coords);

      const span = featureSmoothingSpan(SMOOTHING_METERS, coords, options);

      // Per-point speed in m/s, taken as path length over elapsed time across a
      // fixed metric window centered on the point.
      const values = coords.map((_, i) => {
        if (!times) {
          return NaN;
        }

        const [lo, hi] = metricWindow(cum, i, span);

        const d = cum[hi]! - cum[lo]!;

        const dt = (times[hi]! - times[lo]!) / 1000;

        return dt > 0 && Number.isFinite(d) ? d / dt : NaN;
      });

      return { coords, values };
    }),
};
