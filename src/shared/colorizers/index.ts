import z from 'zod';
import type { Colorizer } from './colorize.js';
import { batteryColorizer } from './modes/battery.js';
import { cadenceColorizer } from './modes/cadence.js';
import { elevationColorizer } from './modes/elevation.js';
import { gsmSignalColorizer } from './modes/gsmSignal.js';
import { headingColorizer } from './modes/heading.js';
import { heartRateColorizer } from './modes/heartRate.js';
import { powerColorizer } from './modes/power.js';
import { speedColorizer } from './modes/speed.js';
import { steepnessColorizer } from './modes/steepness.js';
import { temperatureColorizer } from './modes/temperature.js';
import { timeColorizer } from './modes/time.js';

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
  battery: batteryColorizer,
  gsmSignal: gsmSignalColorizer,
} as const satisfies Record<string, Colorizer>;

// Defines menu order and the source of truth for valid modes.
export const colorizingModes = [
  'time',
  'elevation',
  'steepness',
  'speed',
  'heading',
  'heartRate',
  'cadence',
  'power',
  'temperature',
  'battery',
  'gsmSignal',
] as const satisfies ReadonlyArray<keyof typeof colorizers>;

export type ColorizingMode = (typeof colorizingModes)[number];

export const ColorizingModeSchema = z.enum(colorizingModes);

/** Whether a colorize mode is derived from the elevation coordinate. */
export function colorizerNeedsElevation(mode: ColorizingMode): boolean {
  return Boolean(colorizers[mode].needsElevation);
}

export type { ColorizedPoint, Colorizer, HotlinePalette } from './colorize.js';
