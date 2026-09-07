import { getCoords } from '@turf/invariant';
import type { Feature, LineString } from 'geojson';
import {
  type ColorizeOptions,
  type Colorizer,
  colorizeByValues,
  smoothedValues,
} from '../colorize.js';
import { featureSmoothingSpan } from '../smoothing.js';

// The per-point elevations (metres) and smoothing the colorizer normalizes
// against; shared by `compute` and the legend so both read the same numbers.
function elevationSpec(
  feature: Feature<LineString>,
  options?: ColorizeOptions,
) {
  const coords = getCoords(feature);

  const values = coords.map((c) =>
    c.length >= 3 && Number.isFinite(c[2]) ? (c[2] as number) : NaN,
  );

  // Smoothed only to keep detail finer than a few pixels from reading as color
  // noise when zoomed out. No baseline of its own: the elevation this reads is
  // already despiked (`smoothElevation`), and a second fixed window here would
  // show more terrain in the chart than in the line beside it.
  const smoothSpan = featureSmoothingSpan(0, coords, options);

  return { coords, values, smoothSpan };
}

export const elevationColorizer: Colorizer = {
  needsElevation: true,
  palette: [
    { r: 0, g: 0, b: 0, t: 0.0 },
    { r: 128, g: 128, b: 128, t: 0.5 },
    { r: 255, g: 255, b: 255, t: 1.0 },
  ],
  compute: (features, options) =>
    colorizeByValues(features, (feature) => elevationSpec(feature, options)),
  legend: {
    unit: 'm',
    values: (feature, options) =>
      smoothedValues(elevationSpec(feature, options)),
  },
};
