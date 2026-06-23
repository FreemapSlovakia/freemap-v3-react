import { coordPropColorizer } from './coordPropColorizer.js';

export const heartRateColorizer = coordPropColorizer('heart', [
  { r: 0, g: 100, b: 255, t: 0.0 },
  { r: 0, g: 255, b: 0, t: 0.33 },
  { r: 255, g: 255, b: 0, t: 0.66 },
  { r: 255, g: 0, b: 0, t: 1.0 },
]);
