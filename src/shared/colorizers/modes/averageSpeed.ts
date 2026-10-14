import { scalarSpanColorizer } from './pathDetail.js';

/**
 * The speed the profile expects on each stretch, from GraphHopper's
 * `average_speed` (km/h) — what a planned route has in place of a recording.
 */
export const averageSpeedColorizer = scalarSpanColorizer({
  detail: 'average_speed',
  palette: [
    { r: 0, g: 0, b: 255, t: 0.0 },
    { r: 0, g: 255, b: 0, t: 0.5 },
    { r: 255, g: 0, b: 0, t: 1.0 },
  ],
  unit: 'km/h',
  digits: 1,
});
