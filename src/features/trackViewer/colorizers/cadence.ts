import { coordPropColorizer } from './coordPropColorizer.js';

// togeojson plural-izes `gpxtpx:cad` → `cads` on coordinateProperties.
export const cadenceColorizer = coordPropColorizer('cads', [
  { r: 0, g: 100, b: 255, t: 0.0 },
  { r: 0, g: 255, b: 0, t: 0.5 },
  { r: 255, g: 0, b: 0, t: 1.0 },
]);
