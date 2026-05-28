import { getCoords } from '@turf/invariant';
import { type Colorizer, colorizeByValues } from './types.js';

/**
 * Colour by progression along the track. When timestamps are present each
 * point is positioned by elapsed time, otherwise by index — useful for
 * disambiguating direction on overlapping loops.
 */
export const timeColorizer: Colorizer = {
  palette: [
    { r: 128, g: 0, b: 255, t: 0.0 },
    { r: 0, g: 200, b: 255, t: 0.5 },
    { r: 255, g: 200, b: 0, t: 1.0 },
  ],
  compute: (features) =>
    colorizeByValues(features, (feature) => {
      const coords = getCoords(feature);

      const rawTimes = feature.properties?.['coordTimes'];

      const times =
        Array.isArray(rawTimes) && rawTimes.length === coords.length
          ? rawTimes.map((t) =>
              typeof t === 'string' ? new Date(t).getTime() : NaN,
            )
          : null;

      const values =
        times && times.some((t) => Number.isFinite(t))
          ? times
          : coords.map((_, i) => i);

      return { coords, values };
    }),
};
