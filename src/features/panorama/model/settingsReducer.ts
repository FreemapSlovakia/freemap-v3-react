import { createReducer } from '@reduxjs/toolkit';
import type { PanoramaQuality } from '../quality.js';
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
 * Farthest the haze slider reaches — the API's own ceiling for `range`, so
 * nothing can be rendered for the falloff to act on past it. At this end the
 * falloff does nothing, which is what `0` is for.
 */
export const LABEL_HAZE_MAX_KM = 400;

/**
 * The stops that slider has, with clear air **last**. `0` is no falloff and no
 * cut — names carrying further than any figure on the slider — so it belongs
 * past 400 km, not before 10: everywhere else the slider reads "further to the
 * right", and a `0` at the left end would break that exactly where it means the
 * opposite of what its position says.
 */
export const LABEL_HAZE_STEPS_KM = [
  ...Array.from({ length: LABEL_HAZE_MAX_KM / 10 }, (_, i) => (i + 1) * 10),
  0,
];

/** Which stop a stored haze stands on; anything at or below `0` is clear air. */
export function hazeStepIndex(km: number): number {
  return km > 0
    ? nearestStep(LABEL_HAZE_STEPS_KM.slice(0, -1), km)
    : LABEL_HAZE_STEPS_KM.length - 1;
}

/**
 * How far the picture may see, as the slider's stops in kilometres. The API's
 * own bounds are 1–400 km; the near end starts where a view of nothing but the
 * next hillside stops being one.
 */
export const RANGE_MIN_KM = 10;

export const RANGE_MAX_KM = 400;

/**
 * How hard distance is weighed against a summit's own metres, as the exponent
 * `p` in `dominance / distance ** p`. The ends are the two things a rank can
 * mean: `0` is its real size and `1` the angle it subtends; see
 * `doc/panorama.md`.
 */
export const LABEL_DISTANCE_WEIGHTS = [0, 0.25, 0.5, 0.75, 1];

export const LABEL_DISTANCE_WEIGHT_MAX = LABEL_DISTANCE_WEIGHTS.at(-1) ?? 1;

/**
 * Which stop a stored value sits on. One between two — an older setting, a
 * hand-edited store — snaps to the nearest rather than leaving the slider
 * somewhere it cannot be moved back to.
 */
export function nearestStep(steps: readonly number[], value: number): number {
  return steps.reduce(
    (best, step, i) =>
      Math.abs(step - value) < Math.abs((steps[best] ?? 0) - value) ? i : best,
    0,
  );
}

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

export type PanoramaTilt = 'standard' | 'wide' | 'flat' | 'custom';

/** Angles above and below the horizon a band may reach; short of straight up. */
export const ALT_LIMIT = 89;

/**
 * Where the unfolding slider stops, short of the service's own 45: the lift
 * raises the horizon by its own degrees, and the band raised with it costs
 * pixels, so a caricature past this would buy nothing but render time.
 */
export const DEPTH_LIFT_MAX = 20;

/** Degrees below and above horizontal each tilt preset frames. */
export const PANORAMA_TILTS: Record<
  Exclude<PanoramaTilt, 'custom'>,
  [number, number]
> = {
  standard: [-18, 12],
  wide: [-30, 25],
  flat: [-6, 6],
};

/**
 * The frame a settings state asks for, whichever way it says it. Here beside
 * the presets and the other settings derivations rather than in `quality.ts`,
 * which answers what a tier costs: the framing is a setting, and what reads it
 * is the menu, the modal and the URL codec.
 */
export function tiltRange(settings: PanoramaSettingsState): [number, number] {
  return settings.tilt === 'custom'
    ? [settings.altMin, settings.altMax]
    : PANORAMA_TILTS[settings.tilt];
}

/**
 * What a picture is drawn to look like: the ridge silhouettes' alpha gain and
 * thickness, what they are inked in, and the near ground before haze.
 */
export type PanoramaStyle = {
  ridgeStrength: number;
  ridgeWidth: number;
  ridgeColor: string;
  groundColor: string;
};

/** What the service draws when asked for nothing; the modal resets to these. */
export const PANORAMA_STYLE_DEFAULTS: PanoramaStyle = {
  ridgeStrength: 1,
  ridgeWidth: 1,
  ridgeColor: '#000000',
  groundColor: '#3a4a34',
};

/**
 * Where the strength slider stops. The service has no ceiling — it is a gain on
 * an alpha that clamps at composite — but by about here even the haziest
 * distant ridge has saturated, so anything past it moves nothing.
 */
export const RIDGE_STRENGTH_MAX = 7;

/** The service's own bound: every stroke inks a band of rows, so width costs. */
export const RIDGE_WIDTH_MAX = 20;

/**
 * Named looks, so the usual answer is one press rather than three numbers
 * chosen blind — the only preview a colour has is a whole render.
 *
 * `natural` is the service's own default. The rest are the API's worked
 * examples: no linework at all, an inked map-like one, and a light ground under
 * dark ink. Haze is untouched by any of them, so distance still reads.
 */
export const PANORAMA_LOOKS = {
  natural: PANORAMA_STYLE_DEFAULTS,
  relief: { ...PANORAMA_STYLE_DEFAULTS, ridgeStrength: 0 },
  // A heavier stroke than the API's example asks for: what separates this from
  // the default is meant to read as drawn, and the width is the half of that
  // the alpha gain can't do.
  drawn: {
    ridgeStrength: 2.2,
    ridgeWidth: 1.6,
    ridgeColor: '#000000',
    groundColor: '#7a6a4a',
  },
  engraved: {
    ridgeStrength: 1,
    ridgeWidth: 1,
    ridgeColor: '#2b1a10',
    groundColor: '#d8cfc0',
  },
  /** Whatever the user set by hand; matched by nothing, so it is `null` here. */
  custom: null,
} satisfies Record<string, PanoramaStyle | null>;

/**
 * The looks by name. Derived from the constant rather than declared beside it,
 * so a look added or renamed without a label to go with it is a `tsc` error
 * rather than a menu item that silently renders blank.
 */
export type PanoramaLook = keyof typeof PANORAMA_LOOKS;

export const PANORAMA_LOOK_NAMES = Object.keys(
  PANORAMA_LOOKS,
) as PanoramaLook[];

/** Which named look the current settings are, or `custom` where none matches. */
export function panoramaLookOf(style: PanoramaStyle): PanoramaLook {
  return (
    PANORAMA_LOOK_NAMES.find((name) => {
      const look = PANORAMA_LOOKS[name];

      return (
        look &&
        (Object.keys(look) as (keyof PanoramaStyle)[]).every(
          (key) => look[key] === style[key],
        )
      );
    }) ?? 'custom'
  );
}

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
  /**
   * Degrees far terrain is raised by, unfolding the distance the projection
   * compresses; `0` is a true view. The lift decides what hides what, so it
   * draws summits the eye cannot see — hence `showRevealedLabels`.
   */
  depthLift: number;
  /**
   * Farthest terrain the picture holds, kilometres. Past `FREE_RANGE_MAX_KM` it
   * is premium's — every extra kilometre is samples on every ray.
   */
  rangeKm: number;
  /**
   * Whether the summits only the lift brings into view are named. A filter over
   * the labels in hand, so it is instant; the lift itself costs a render.
   */
  showRevealedLabels: boolean;
  /** How the picture is drawn; see `PANORAMA_LOOKS`. */
  ridgeStrength: number;
  ridgeWidth: number;
  ridgeColor: string;
  groundColor: string;
  /** How many names to draw, `0` for none; see {@link labelLayoutLimits}. */
  labelDensity: number;
  /** Metres of dominance a summit needs to be named; see {@link DOMINANCE_STEPS_M}. */
  minDominance: number;
  /**
   * How far a name has to carry: both the falloff the rank is weighed by and,
   * a few times further out, where names stop altogether. `0` is clear air —
   * no falloff and no cut. See `hazeCutoffM`.
   */
  labelHazeKm: number;
  /** What the rank measures; see {@link LABEL_DISTANCE_WEIGHTS}. */
  labelDistanceWeight: number;
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
  depthLift: 0,
  // The service's own default, and what every render asked for before there was
  // a control: free accounts see no change.
  rangeKm: 300,
  showRevealedLabels: true,
  ...PANORAMA_STYLE_DEFAULTS,
  labelDensity: 5,
  minDominance: NO_DOMINANCE_FILTER,
  labelHazeKm: 120,
  labelDistanceWeight: 0.5,
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
