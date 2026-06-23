import { getCoords } from '@turf/invariant';
import {
  type Colorizer,
  colorizeByValues,
  type HotlinePalette,
  hasNumericArray,
  readNumericArray,
} from './types.js';

/**
 * Like {@link coordPropColorizer} but maps each value onto a fixed `[min, max]`
 * scale rather than the per-track min/max, so a color means the same thing
 * across tracks (e.g. battery 0–100 %). Values outside the range are clamped;
 * missing values become gaps.
 */
export function coordPropColorizerAbsolute(
  key: string,
  palette: HotlinePalette,
  min: number,
  max: number,
): Colorizer {
  return {
    palette,
    isAvailable: (features) => hasNumericArray(features, key),
    compute: (features) =>
      features.map((feature) => {
        const coords = getCoords(feature);

        const values =
          readNumericArray(feature, key, coords.length) ??
          coords.map(() => NaN);

        return coords.map((coord, i) => {
          const v = values[i];

          const finite = Number.isFinite(v);

          const color = finite
            ? Math.max(0, Math.min(1, (v - min) / (max - min)))
            : 0.5;

          return { lat: coord[1], lon: coord[0], color, gap: !finite };
        });
      }),
  };
}

/**
 * Builds a Colorizer that reads a numeric series from
 * `feature.properties.coordinateProperties[key]` (the array shape produced
 * by `@tmcw/togeojson` for GPX TrackPointExtension fields).
 */
export function coordPropColorizer(
  key: string,
  palette: HotlinePalette,
): Colorizer {
  return {
    palette,
    isAvailable: (features) => hasNumericArray(features, key),
    compute: (features) =>
      colorizeByValues(features, (feature) => {
        const coords = getCoords(feature);

        const values =
          readNumericArray(feature, key, coords.length) ??
          coords.map(() => NaN);

        return { coords, values };
      }),
  };
}
