import { coordPropColorizer } from '../coordPropColorizer.js';

// `gpxtpx:atemp` → `atemps` (air temperature in °C).
export const temperatureColorizer = coordPropColorizer('atemps', [
  { r: 0, g: 100, b: 255, t: 0.0 },
  { r: 0, g: 255, b: 255, t: 0.25 },
  { r: 0, g: 255, b: 0, t: 0.5 },
  { r: 255, g: 255, b: 0, t: 0.75 },
  { r: 255, g: 0, b: 0, t: 1.0 },
]);
