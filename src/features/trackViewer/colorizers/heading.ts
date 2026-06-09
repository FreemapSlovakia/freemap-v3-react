import { bearing } from '@turf/bearing';
import { getCoords } from '@turf/invariant';
import type { Colorizer } from './types.js';

/**
 * Colour by compass bearing of each segment, mapped cyclically onto a hue
 * wheel so opposite directions get opposite colours. North maps to red,
 * East to yellow-green, South to cyan, West to magenta.
 */
export const headingColorizer: Colorizer = {
  // Hotline lerps RGB linearly between stops, so a 7-stop wheel is enough
  // to approximate the HSV cycle; matching endpoints keeps it seamless.
  palette: [
    { r: 255, g: 0, b: 0, t: 0.0 },
    { r: 255, g: 255, b: 0, t: 1 / 6 },
    { r: 0, g: 255, b: 0, t: 2 / 6 },
    { r: 0, g: 255, b: 255, t: 3 / 6 },
    { r: 0, g: 0, b: 255, t: 4 / 6 },
    { r: 255, g: 0, b: 255, t: 5 / 6 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  compute: (features) =>
    features.map((feature) => {
      const coords: [number, number][] = getCoords(feature);

      let prev = coords[0];

      return coords.map((coord) => {
        let color = 0;

        if (coord !== prev) {
          // turf bearing returns -180..180; shift to 0..360 then normalize.
          const b = bearing([prev![0], prev![1]], [coord[0], coord[1]]);

          color = (((b + 360) % 360) / 360 + Number.EPSILON) % 1;
        }

        prev = coord;

        return { lat: coord[1], lon: coord[0], color };
      });
    }),
};
