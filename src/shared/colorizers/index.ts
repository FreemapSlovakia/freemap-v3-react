import z from 'zod';
import type { Colorizer } from './colorize.js';
import { batteryColorizer } from './modes/battery.js';
import { cadenceColorizer } from './modes/cadence.js';
import { elevationColorizer } from './modes/elevation.js';
import { gsmSignalColorizer } from './modes/gsmSignal.js';
import { headingColorizer } from './modes/heading.js';
import { heartRateColorizer } from './modes/heartRate.js';
import { hikeRatingColorizer } from './modes/hikeRating.js';
import { mtbRatingColorizer } from './modes/mtbRating.js';
import { powerColorizer } from './modes/power.js';
import { roadTypeColorizer } from './modes/roadType.js';
import { smoothnessColorizer } from './modes/smoothness.js';
import { speedColorizer } from './modes/speed.js';
import { steepnessColorizer } from './modes/steepness.js';
import { surfaceColorizer } from './modes/surface.js';
import { temperatureColorizer } from './modes/temperature.js';
import { timeColorizer } from './modes/time.js';
import { trackTypeColorizer } from './modes/trackType.js';

export const colorizers = {
  elevation: elevationColorizer,
  steepness: steepnessColorizer,
  surface: surfaceColorizer,
  smoothness: smoothnessColorizer,
  roadType: roadTypeColorizer,
  trackType: trackTypeColorizer,
  hikeRating: hikeRatingColorizer,
  mtbRating: mtbRatingColorizer,
  speed: speedColorizer,
  heartRate: heartRateColorizer,
  cadence: cadenceColorizer,
  power: powerColorizer,
  temperature: temperatureColorizer,
  time: timeColorizer,
  heading: headingColorizer,
  battery: batteryColorizer,
  gsmSignal: gsmSignalColorizer,
} as const satisfies Record<string, Colorizer>;

// Menu order, in groups the dropdown sets off with dividers: the terrain, how
// the user moved, what the way is, what a sensor recorded, what the device did.
export const colorizingModeGroups = [
  ['elevation', 'steepness'],
  ['time', 'speed', 'heading'],
  ['surface', 'smoothness', 'roadType', 'trackType', 'hikeRating', 'mtbRating'],
  ['heartRate', 'cadence', 'power', 'temperature'],
  ['battery', 'gsmSignal'],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof typeof colorizers>>;

/** Menu order, and the source of truth for valid modes. */
export const colorizingModes = colorizingModeGroups.flat();

export type ColorizingMode = (typeof colorizingModes)[number];

/** Index of the menu group a mode is in, so the menu can divide between them. */
export function colorizingModeGroup(mode: ColorizingMode): number {
  return colorizingModeGroups.findIndex((group) =>
    (group as readonly string[]).includes(mode),
  );
}

export const ColorizingModeSchema = z.enum(colorizingModes);

/** Whether a colorize mode is derived from the elevation coordinate. */
export function colorizerNeedsElevation(mode: ColorizingMode): boolean {
  return Boolean(colorizers[mode].needsElevation);
}

export type { ColorizedPoint, Colorizer, HotlinePalette } from './colorize.js';
