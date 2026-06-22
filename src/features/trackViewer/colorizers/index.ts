import z from 'zod';
import { cadenceColorizer } from './cadence.js';
import { elevationColorizer } from './elevation.js';
import { headingColorizer } from './heading.js';
import { heartRateColorizer } from './heartRate.js';
import { powerColorizer } from './power.js';
import { speedColorizer } from './speed.js';
import { steepnessColorizer } from './steepness.js';
import { temperatureColorizer } from './temperature.js';
import { timeColorizer } from './time.js';
import type { Colorizer } from './types.js';

export const colorizers = {
  elevation: elevationColorizer,
  steepness: steepnessColorizer,
  speed: speedColorizer,
  heartRate: heartRateColorizer,
  cadence: cadenceColorizer,
  power: powerColorizer,
  temperature: temperatureColorizer,
  time: timeColorizer,
  heading: headingColorizer,
} as const satisfies Record<string, Colorizer>;

// Defines menu order and the source of truth for valid modes.
export const colorizingModes = [
  'elevation',
  'steepness',
  'speed',
  'heartRate',
  'cadence',
  'power',
  'temperature',
  'time',
  'heading',
] as const satisfies ReadonlyArray<keyof typeof colorizers>;

export type ColorizingMode = (typeof colorizingModes)[number];

export const ColorizingModeSchema = z.enum(colorizingModes);

/** Whether a colorize mode is derived from the elevation coordinate. */
export function colorizerNeedsElevation(mode: ColorizingMode): boolean {
  return Boolean(colorizers[mode].needsElevation);
}

export type { ColorizedPoint, Colorizer, HotlinePalette } from './types.js';
