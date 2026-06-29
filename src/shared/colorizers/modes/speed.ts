import { cumulativeDistances, metricWindow } from '@shared/geoutils.js';
import { getCoords } from '@turf/invariant';
import type { Feature, LineString } from 'geojson';
import {
  type ColorizeOptions,
  type Colorizer,
  colorizeByValues,
  hasNumericArray,
  readCoordTimes,
  readNumericArray,
  smoothedValues,
} from '../colorize.js';
import { featureSmoothingSpan } from '../smoothing.js';

// Speed is averaged over this horizontal span to absorb GPS jitter and
// quantized timestamps; a single short segment can otherwise read as a spike.
const SMOOTHING_METERS = 50;

// Per-point speed in m/s and its smoothing; shared by `compute` and the legend.
function speedSpec(feature: Feature<LineString>, options?: ColorizeOptions) {
  const coords = getCoords(feature);

  const span = featureSmoothingSpan(SMOOTHING_METERS, coords, options);

  // Prefer the device-recorded speed (m/s) when present; the colorizer
  // normalizes per track, so the unit only has to be consistent. It's a raw
  // per-point series, so it's low-passed over the same span.
  const recorded = readNumericArray(feature, 'speeds', coords.length);

  if (recorded && recorded.some((v) => Number.isFinite(v))) {
    return { coords, values: recorded, smoothSpan: span };
  }

  // Otherwise derive per-point speed in m/s as path length over elapsed time
  // across the fixed metric window centered on the point — here the window
  // itself is the smoothing.
  const times = readCoordTimes(feature, coords.length);

  const cum = cumulativeDistances(coords);

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
}

export const speedColorizer: Colorizer = {
  palette: [
    { r: 0, g: 0, b: 255, t: 0.0 },
    { r: 0, g: 255, b: 0, t: 0.5 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  isAvailable: (features) =>
    hasNumericArray(features, 'speeds') ||
    features.some(
      (f) => readCoordTimes(f, f.geometry.coordinates.length) !== null,
    ),
  compute: (features, options) =>
    colorizeByValues(features, (feature) => speedSpec(feature, options)),
  legend: {
    unit: 'km/h',
    // m/s → km/h; the conversion is monotonic so it doesn't change the colors.
    values: (feature, options) =>
      smoothedValues(speedSpec(feature, options)).map((v) => v * 3.6),
  },
};
