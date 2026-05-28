import { smoothElevations } from '@shared/geoutils.js';
import { getCoords } from '@turf/invariant';
import type { Colorizer } from './types.js';

const SMOOTHING = 5;

export const elevationColorizer: Colorizer = {
  palette: [
    { r: 0, g: 0, b: 0, t: 0.0 },
    { r: 128, g: 128, b: 128, t: 0.5 },
    { r: 255, g: 255, b: 255, t: 1.0 },
  ],
  compute: (features) =>
    features.map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), SMOOTHING);

      const eles = smoothed
        .map((coord) => coord[2])
        .filter((e): e is number => Number.isFinite(e));

      const range = eles.length ? Math.max(...eles) - Math.min(...eles) : 0;

      const minEle = eles.length ? Math.min(...eles) : 0;

      return smoothed.map((coord) => {
        const color =
          range > 0 && Number.isFinite(coord[2])
            ? (coord[2] - minEle) / range
            : 0.5;

        return { lat: coord[1], lon: coord[0], color };
      });
    }),
};
