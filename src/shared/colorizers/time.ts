import { getCoords } from '@turf/invariant';
import { type Colorizer, colorizeByValues, readCoordTimes } from './types.js';

/**
 * Colour by elapsed time along the track. Offered only when real per-point
 * timestamps exist (e.g. a recorded GPX); a planned route has none, so the
 * mode is hidden there rather than falling back to a misleading index ramp.
 */
export const timeColorizer: Colorizer = {
  palette: [
    { r: 128, g: 0, b: 255, t: 0.0 },
    { r: 0, g: 200, b: 255, t: 0.5 },
    { r: 255, g: 200, b: 0, t: 1.0 },
  ],
  isAvailable: (features) =>
    features.some((feature) => {
      const times = readCoordTimes(
        feature,
        feature.geometry.coordinates.length,
      );

      return times !== null && times.some((t) => Number.isFinite(t));
    }),
  compute: (features) =>
    colorizeByValues(features, (feature) => {
      const coords = getCoords(feature);

      // Missing timestamps become NaN, which colorizeByValues renders as gaps —
      // so a track without time draws nothing rather than an index ramp.
      const values =
        readCoordTimes(feature, coords.length) ?? coords.map(() => NaN);

      return { coords, values };
    }),
};
