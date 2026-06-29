import { coordPropColorizer } from '../coordPropColorizer.js';

// `power` is a common custom GPX extension; togeojson pluralises to `powers`.
export const powerColorizer = coordPropColorizer(
  'powers',
  [
    { r: 0, g: 100, b: 255, t: 0.0 },
    { r: 0, g: 255, b: 0, t: 0.5 },
    { r: 255, g: 200, b: 0, t: 0.75 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  'W',
);
