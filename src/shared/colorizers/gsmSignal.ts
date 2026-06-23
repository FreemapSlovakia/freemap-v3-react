import { coordPropColorizerAbsolute } from './coordPropColorizer.js';

// Absolute 0–100 % scale so a color means the same across tracks: weak → red,
// strong → green.
export const gsmSignalColorizer = coordPropColorizerAbsolute(
  'gsmSignal',
  [
    { r: 255, g: 0, b: 0, t: 0.0 },
    { r: 255, g: 200, b: 0, t: 0.5 },
    { r: 0, g: 200, b: 0, t: 1.0 },
  ],
  0,
  100,
);
