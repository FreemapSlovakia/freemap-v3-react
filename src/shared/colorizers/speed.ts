import { distance } from '@turf/distance';
import { getCoords } from '@turf/invariant';
import type { Feature, LineString } from 'geojson';
import { type Colorizer, colorizeByValues } from './types.js';

const WINDOW = 5;

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
  compute: (features) =>
    colorizeByValues(features, (feature) => {
      const coords = getCoords(feature);

      const times = getTimes(feature, coords.length);

      // Per-point speed in m/s, averaged over a small window to absorb
      // GPS jitter and quantized timestamps.
      const values = coords.map((_, i) => {
        if (!times) {
          return NaN;
        }

        const j = Math.max(0, i - WINDOW);

        const k = Math.min(coords.length - 1, i + WINDOW);

        let d = 0;

        for (let n = j + 1; n <= k; n++) {
          d += distance(
            [coords[n][0], coords[n][1]],
            [coords[n - 1][0], coords[n - 1][1]],
            { units: 'meters' },
          );
        }

        const dt = (times[k] - times[j]) / 1000;

        return dt > 0 && Number.isFinite(d) ? d / dt : NaN;
      });

      return { coords, values };
    }),
};
