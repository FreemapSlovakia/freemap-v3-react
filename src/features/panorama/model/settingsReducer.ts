import { createReducer } from '@reduxjs/toolkit';
import type { PanoramaQuality, PanoramaTilt } from '../quality.js';
import { panoramaSetSettings } from './actions.js';

/**
 * How crowded the picture may get, as a bare level rather than a threshold:
 * what ranks a peak weighs its dominance against its distance and so has no
 * unit to set a cut in, and what a view offers depends entirely on where the
 * user stood. Ranking by it and taking the best few that fit is what the
 * measure is good for.
 */

/** The busiest setting; `0` is no names at all. */
export const LABEL_DENSITY_MAX = 10;

export type LabelLayoutLimits = {
  /** Viewport width one name may claim; absent means as many as will fit. */
  pitchPx?: number;
  maxClimbPx: number;
};

/**
 * What a density setting means to the layout, or `null` for no names at all.
 *
 * Both limits move together, because either alone is the one that binds and the
 * other then does nothing — a skyline offers far more peaks than fit on one
 * line, so what actually decides the count is how many lines they may stack
 * into. Geometric rather than linear: the difference between 140 px and 120 px
 * of elbow room is nothing, while 40 px to 20 px is a different picture.
 *
 * The busiest setting drops the width limit entirely: the most there can be is
 * however many the picture will physically hold, which is what asking for the
 * most ought to mean.
 */
export function labelLayoutLimits(level: number): LabelLayoutLimits | null {
  if (level <= 0) {
    return null;
  }

  const t = (Math.min(level, LABEL_DENSITY_MAX) - 1) / (LABEL_DENSITY_MAX - 1);

  return {
    ...(level >= LABEL_DENSITY_MAX
      ? {}
      : { pitchPx: Math.round(140 * (24 / 140) ** t) }),
    maxClimbPx: Math.round(24 * (208 / 24) ** t),
  };
}

/**
 * The step that filters nothing. A real number rather than `-Infinity`, which
 * would not survive being stored; deeper than any terrain, so it keeps even the
 * most subordinate top.
 */
export const NO_DOMINANCE_FILTER = -100_000;

/**
 * Metres of dominance a summit needs before it is a candidate at all, as the
 * stops the slider has. Dominance is signed — a top that never rises clear of
 * its own ridge scores how far the ridge stands over it — so the negative stops
 * are real settings: they keep the tops that merely sit under their ridge while
 * dropping the bumps buried deep inside a massif. `0` is "only what stands
 * clear of its surroundings", which is what most people mean by a peak.
 *
 * Stops rather than a continuous range, because the useful values are spread
 * over three orders of magnitude: a linear slider across them would spend
 * nearly all its travel on the part nobody wants, and a logarithmic one cannot
 * cross zero. A 1-2-3-5-7 series per decade, each way from zero, gives a slider
 * fine enough to feel continuous while every stop it lands on is a round number
 * — nobody wants a threshold of 137 m.
 *
 * This and the density are two different questions — which summits count, and
 * how many of them fit — and both are answered here rather than in the request:
 * the service is always asked for everything it will name, because narrowing
 * the ask can only take candidates away and would cost a whole render to
 * change, while a filter over what already arrived is instant.
 */
const DOMINANCE_MAGNITUDES_M = [1, 2, 3, 5, 7].flatMap((mantissa) =>
  [1, 10, 100].map((decade) => mantissa * decade),
);

export const DOMINANCE_STEPS_M = [
  NO_DOMINANCE_FILTER,
  ...DOMINANCE_MAGNITUDES_M.map((m) => -m),
  0,
  ...DOMINANCE_MAGNITUDES_M,
  1000,
].sort((a, b) => a - b);

export interface PanoramaSettingsState {
  /**
   * Which tier to ask for. Everything above the coarsest is premium's, and the
   * service clamps what an account may have regardless of what is asked.
   */
  quality: PanoramaQuality;
  /** How much sky and ground the frame holds; `custom` uses the two below. */
  tilt: PanoramaTilt;
  altMin: number;
  altMax: number;
  /** Eye height above the ground, metres. */
  eye: number;
  /** How many names to draw, `0` for none; see {@link labelLayoutLimits}. */
  labelDensity: number;
  /** Metres of dominance a summit needs to be named; see {@link DOMINANCE_STEPS_M}. */
  minDominance: number;
  /**
   * Lets the view move on its own: toward where the device points where there
   * is a compass to ask, and at a steady turn where there is not. Turning the
   * picture by hand clears it, the same as the stop button does.
   */
  autoPan: boolean;
}

/**
 * A phone is held, not pointed with a mouse, so it turns by itself until the
 * user takes over. A stored preference wins over this.
 */
function touchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches
  );
}

export const panoramaSettingsInitialState: PanoramaSettingsState = {
  // What to ask for, not what will be granted: an account without premium is
  // put back to `FREE_QUALITY` before the request goes out. Defaulting to a
  // middling tier rather than the free one keeps a premium user off the free
  // picture without their finding this control, and rather than the finest one
  // because that is half a minute of a server that renders one at a time.
  quality: 'standard',
  tilt: 'standard',
  altMin: -18,
  altMax: 12,
  eye: 1.7,
  labelDensity: 5,
  minDominance: NO_DOMINANCE_FILTER,
  autoPan: touchDevice(),
};

export const panoramaSettingsReducer = createReducer(
  panoramaSettingsInitialState,
  (builder) =>
    builder.addCase(panoramaSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
