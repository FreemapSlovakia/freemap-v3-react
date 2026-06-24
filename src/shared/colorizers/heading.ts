import { bearing } from '@turf/bearing';
import { getCoords } from '@turf/invariant';
import { type Colorizer, readNumericArray } from './types.js';

// Map a compass bearing (degrees) onto the 0..1 hue wheel, normalizing any
// out-of-range value first. The EPSILON nudge keeps exact north off the 0 edge.
const toHue = (deg: number) =>
  ((((deg % 360) + 360) % 360) / 360 + Number.EPSILON) % 1;

/**
 * Colour by compass bearing, mapped cyclically onto a hue wheel so opposite
 * directions get opposite colours. North maps to red, East to yellow-green,
 * South to cyan, West to magenta. Prefers the device-recorded course when the
 * track carries one, otherwise derives heading from the segment geometry.
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

      const recorded = readNumericArray(feature, 'courses', coords.length);

      let lastColor = 0;

      return coords.map((coord, i) => {
        const rec = recorded?.[i];

        if (rec != null && Number.isFinite(rec)) {
          lastColor = toHue(rec);
        } else {
          const next = coords[i + 1];

          // Heading at a point is the bearing of the segment leaving it. The
          // last point, and any zero-length segment (e.g. a coordinate
          // duplicated where two route steps meet), reuse the previous heading
          // instead of snapping to north.
          if (next && (next[0] !== coord[0] || next[1] !== coord[1])) {
            lastColor = toHue(
              bearing([coord[0], coord[1]], [next[0], next[1]]),
            );
          }
        }

        return { lat: coord[1], lon: coord[0], color: lastColor };
      });
    }),
};
