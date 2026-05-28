import { getCoords } from '@turf/invariant';
import {
  type Colorizer,
  colorizeByValues,
  type HotlinePalette,
  hasNumericArray,
  readNumericArray,
} from './types.js';

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
