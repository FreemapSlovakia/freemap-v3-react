import { smoothElevations } from '@shared/geoutils.js';
import { distance } from '@turf/distance';
import { getCoords } from '@turf/invariant';
import type { Colorizer } from './types.js';

const SMOOTHING = 5;

export const steepnessColorizer: Colorizer = {
  palette: [
    { r: 0, g: 255, b: 0, t: 0.0 },
    { r: 255, g: 255, b: 255, t: 0.5 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  compute: (features) =>
    features.map((feature) => {
      const smoothed = smoothElevations(getCoords(feature), SMOOTHING);

      let prevCoord = smoothed[0];

      return smoothed.map((coord) => {
        const [lon, lat, ele] = coord;

        const d = distance([lon, lat], prevCoord, { units: 'meters' });

        let angle = 0;

        if (d > 0 && Number.isFinite(ele) && Number.isFinite(prevCoord[2])) {
          angle = (ele - prevCoord[2]) / d;
        }

        prevCoord = coord;

        const color = Number.isFinite(angle)
          ? Math.max(0, Math.min(1, angle / 0.5 + 0.5))
          : 0.5;

        return { lat, lon, color };
      });
    }),
};
