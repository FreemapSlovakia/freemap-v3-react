import { cumulativeDistances, smoothAngles } from '@shared/geoutils.js';
import { bearing } from '@turf/bearing';
import { getCoords } from '@turf/invariant';
import type { Colorizer } from '../colorize.js';
import { featureSmoothingSpan } from '../smoothing.js';

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
  compute: (features, options) =>
    features.map((feature) => {
      const coords: [number, number][] = getCoords(feature);

      let last = 0;

      // Heading at a point is the bearing of the segment leaving it. The last
      // point, and any zero-length segment (e.g. a coordinate duplicated where
      // two route steps meet), reuse the previous heading instead of snapping
      // to north.
      const bearings = coords.map((coord, i) => {
        const next = coords[i + 1];

        if (next && (next[0] !== coord[0] || next[1] !== coord[1])) {
          last = bearing([coord[0], coord[1]], [next[0], next[1]]);
        }

        return last;
      });

      // Bearings wrap, so smoothing must be circular (vector-averaged).
      const smoothed = smoothAngles(
        bearings,
        cumulativeDistances(coords),
        featureSmoothingSpan(0, coords, options),
      );

      return coords.map((coord, i) => {
        // smoothAngles (and turf bearing) yield −180..180; shift to the 0..1
        // hue wheel.
        const color = ((smoothed[i]! + 360) % 360) / 360;

        return { lat: coord[1], lon: coord[0], color };
      });
    }),
};
