import { rgbaStringToHexa, toRgbaString } from '@shared/colorAlpha.js';
import { nearestStep } from '@shared/mathUtils.js';
import z from 'zod';

/**
 * One stop of the ground ramp: where it sits, and what colour the terrain is
 * painted there.
 *
 * Positions are not metres. The service maps distance to `s = 2d / (d + far)`,
 * so `1` lands exactly on the far distance and `0.5` a third of the way out —
 * which is the compression a panorama wants, the near field being most of the
 * frame.
 */
export type PanoramaGradientStop = {
  pos: number;
  /** `#rrggbb`; the sky is asked for by {@link PanoramaGradient.fadeToSky}. */
  color: string;
};

/** The ramp that replaces `ground_color` and the built-in haze together. */
export type PanoramaGradient = {
  stops: PanoramaGradientStop[];
  /**
   * The last stop is the sky's own colour at each row, so far terrain dissolves
   * into the horizon instead of edging against it. Off gives the hard skyline a
   * poster wants. Only the last stop, which is the only place the picture is
   * against sky.
   */
  fadeToSky: boolean;
  /** Where the ramp ends, kilometres, or `null` to measure what is in frame. */
  farKm: number | null;
  /**
   * Terrain past the far end is dropped rather than painted flat in the last
   * colour — which is what keeps the whole palette on what the picture shows.
   * Summits standing on clipped ground come back invisible.
   */
  clip: boolean;
};

/** The service's own cap. */
export const GRADIENT_MAX_STOPS = 32;

/**
 * The rungs the service rounds an automatic far distance up to, kilometres, so
 * a figure read out of `meta` lands on a stop of the slider that sets it.
 */
export const GRADIENT_FAR_STEPS_KM = [
  1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 100, 150, 200, 300, 400,
];

/**
 * Ready-made ramps, offered as the picker's own swatches — the only preview a
 * colour has here is a whole render, so choosing five colours blind is not a
 * thing to ask of anyone. The first is what a ramp starts as.
 *
 * Colours only: taking one leaves the fade, the far distance and the clipping
 * where the user set them.
 */
const GRADIENT_PRESET_STOPS: PanoramaGradientStop[][] = [
  // Layered — the hand-drawn panorama: warm near, violet far.
  [
    { pos: 0, color: '#2f4020' },
    { pos: 0.25, color: '#4a6b4e' },
    { pos: 0.5, color: '#5f8298' },
    { pos: 0.75, color: '#8a92bd' },
    { pos: 1, color: '#b8c6e0' },
  ],
  // Aerial — nearest the built-in haze, but with the far ranges separating
  // rather than arriving as one wash.
  [
    { pos: 0, color: '#3a4a34' },
    { pos: 0.45, color: '#6f89a0' },
    { pos: 1, color: '#9fbcd6' },
  ],
  // Poster — hard bands. Two stops sharing a position is how the service is
  // asked for an edge rather than a blend.
  [
    { pos: 0, color: '#2b3a1c' },
    { pos: 0.4, color: '#2b3a1c' },
    { pos: 0.4, color: '#6d7f9c' },
    { pos: 0.75, color: '#6d7f9c' },
    { pos: 0.75, color: '#b9a7c8' },
    { pos: 1, color: '#b9a7c8' },
  ],
  // Autumn — warm ochre.
  [
    { pos: 0, color: '#4a3c1e' },
    { pos: 0.4, color: '#8a7a4a' },
    { pos: 1, color: '#c8b98f' },
  ],
  // Haze — desaturated grey.
  [
    { pos: 0, color: '#3f4a3f' },
    { pos: 0.5, color: '#8f9aa0' },
    { pos: 1, color: '#cfd8de' },
  ],
  // Spectrum — reads distance off the picture the way a legend does.
  [
    { pos: 0, color: '#a3242b' },
    { pos: 0.17, color: '#e07b1e' },
    { pos: 0.33, color: '#d9c22b' },
    { pos: 0.5, color: '#3f9a4e' },
    { pos: 0.67, color: '#2f7fc1' },
    { pos: 0.84, color: '#5145a3' },
    { pos: 1, color: '#9b6fc0' },
  ],
  // Alpenglow — shadowed foreground under a lit horizon.
  [
    { pos: 0, color: '#2a2320' },
    { pos: 0.3, color: '#6b3f2e' },
    { pos: 0.55, color: '#c1663f' },
    { pos: 0.78, color: '#e0a07a' },
    { pos: 1, color: '#f2d3bd' },
  ],
  // Blue hour — dusk, the near ground already dark.
  [
    { pos: 0, color: '#1b2430' },
    { pos: 0.35, color: '#2f4858' },
    { pos: 0.6, color: '#4a6a8a' },
    { pos: 0.82, color: '#8fa8c8' },
    { pos: 1, color: '#c9d8ea' },
  ],
  // Sepia — an old print.
  [
    { pos: 0, color: '#3a2f24' },
    { pos: 0.35, color: '#7a6a52' },
    { pos: 0.7, color: '#b8a888' },
    { pos: 1, color: '#e4dac6' },
  ],
  // Woodblock — flat muted bands, no blending anywhere.
  [
    { pos: 0, color: '#3d4a3a' },
    { pos: 0.3, color: '#3d4a3a' },
    { pos: 0.3, color: '#7a8a6a' },
    { pos: 0.55, color: '#7a8a6a' },
    { pos: 0.55, color: '#a8b4c0' },
    { pos: 0.8, color: '#a8b4c0' },
    { pos: 0.8, color: '#d6d0c4' },
    { pos: 1, color: '#d6d0c4' },
  ],
  // Synthwave — neon, near black to sodium.
  [
    { pos: 0, color: '#2b1040' },
    { pos: 0.35, color: '#7a1f6b' },
    { pos: 0.6, color: '#c8306b' },
    { pos: 0.8, color: '#f06a4a' },
    { pos: 1, color: '#ffc48a' },
  ],
  // Emerald to gold.
  [
    { pos: 0, color: '#12301f' },
    { pos: 0.3, color: '#1f6b45' },
    { pos: 0.55, color: '#6ea84f' },
    { pos: 0.8, color: '#cbb24a' },
    { pos: 1, color: '#efe0a0' },
  ],
  // Copper and teal — the far field turning against the near.
  [
    { pos: 0, color: '#33261c' },
    { pos: 0.3, color: '#8a4a2a' },
    { pos: 0.5, color: '#b98a5a' },
    { pos: 0.75, color: '#3f8a8a' },
    { pos: 1, color: '#a8d0d0' },
  ],
  // Ink wash — one value from near black to paper.
  [
    { pos: 0, color: '#1e1e1e' },
    { pos: 0.35, color: '#4a4a4a' },
    { pos: 0.62, color: '#8a8a8a' },
    { pos: 0.85, color: '#bdbdbd' },
    { pos: 1, color: '#ececec' },
  ],
];

/**
 * The ground the panorama ships with, and what a ramp is when there was none:
 * the first preset, ending in its own colour. Fading is asked for rather than
 * assumed — every preset is written to stand without it.
 */
export const PANORAMA_GRADIENT_DEFAULT: PanoramaGradient = {
  stops: [...GRADIENT_PRESET_STOPS[0]],
  fadeToSky: false,
  farKm: null,
  clip: true,
};

/**
 * The service's sky at the horizon — its ramp is `rgb(196,216,238)` there,
 * deepening to `rgb(110,156,214)` at 30°. Far terrain stands against the
 * horizon, so this is what a `"sky"` stop actually paints, not a guess at it.
 */
export const SKY_COLOR = '#c4d8ee';

/**
 * Sorted and cut to what the service takes. The stops go out over the wire from
 * whatever the store holds, and it refuses a list that goes backwards or one
 * past its cap — neither of which any control here can fix afterwards.
 */
export function normalizeStops(
  stops: PanoramaGradientStop[],
): PanoramaGradientStop[] {
  return [...stops].sort((a, b) => a.pos - b.pos).slice(0, GRADIENT_MAX_STOPS);
}

/**
 * The ramp as it will be drawn, which is what a preview must show: a fading
 * last stop is the sky, whatever colour it holds for when the fade is off.
 */
export function previewStops(
  gradient: PanoramaGradient,
): PanoramaGradientStop[] {
  return gradient.fadeToSky
    ? gradient.stops.map((stop, i) =>
        i === gradient.stops.length - 1 ? { ...stop, color: SKY_COLOR } : stop,
      )
    : gradient.stops;
}

/**
 * The inverse: what to store for stops that came back from the picker. The sky
 * is shown rather than kept, so the fading end is put back to the colour it
 * holds for when the fade is turned off — matched by position as well as by
 * being last, since a stop added beyond it would otherwise leave the literal
 * sky standing mid-ramp.
 */
export function storedStops(
  gradient: PanoramaGradient | null,
  stops: PanoramaGradientStop[],
): PanoramaGradientStop[] {
  const faded = gradient?.fadeToSky
    ? gradient.stops[gradient.stops.length - 1]
    : null;

  return normalizeStops(
    !faded
      ? stops
      : stops.map((stop, i) =>
          stop.color === SKY_COLOR &&
          (i === stops.length - 1 || stop.pos === faded.pos)
            ? { ...stop, color: faded.color }
            : stop,
        ),
  );
}

/**
 * The ramp as CSS, which is what the picker speaks. `active` marks the stop it
 * has selected — the picker says so by upper-casing that stop's `RGBA`, and
 * loses the selection unless it is handed back the same way.
 */
export function gradientToCss(
  stops: PanoramaGradientStop[],
  active?: number,
): string {
  return `linear-gradient(90deg, ${stops
    .map(({ pos, color }, i) => {
      const rgba = toRgbaString(color);

      return `${i === active ? rgba.replace('rgba', 'RGBA') : rgba} ${Math.round(pos * 100)}%`;
    })
    .join(', ')})`;
}

export const GRADIENT_PRESETS = GRADIENT_PRESET_STOPS.map((stops) =>
  gradientToCss(stops),
);

/**
 * How many of the user's own ramps are kept beside the built-in swatches: what
 * is left of the picker's own eighteen, where it cuts the list. Read off the
 * presets, so adding one takes a slot back rather than silently dropping the
 * newest ramp.
 */
export const MAX_RECENT_GRADIENTS = Math.max(18 - GRADIENT_PRESETS.length, 0);

/** What a list of stops is, for comparing two ramps and for the render key. */
function stopsKey(stops: PanoramaGradientStop[]): string {
  return stops.map(({ pos, color }) => `${pos}:${color}`).join(',');
}

/**
 * The user's own ramps, freshest first, with `stops` moved to the front. One of
 * the built-in swatches is not kept: the slot would say what is already there.
 */
export function rememberedGradients(
  recent: PanoramaGradientStop[][],
  stops: PanoramaGradientStop[],
): PanoramaGradientStop[][] {
  const key = stopsKey(stops);

  return GRADIENT_PRESET_STOPS.some((preset) => stopsKey(preset) === key)
    ? recent
    : [stops, ...recent.filter((other) => stopsKey(other) !== key)].slice(
        0,
        MAX_RECENT_GRADIENTS,
      );
}

/** The rungs the far-distance slider offers, Automatic — no distance — first. */
export function gradientFarSteps(rangeKm: number): (number | null)[] {
  return [null, ...GRADIENT_FAR_STEPS_KM.filter((km) => km <= rangeKm)];
}

/**
 * Which of those a stored far distance stands on. As `hazeStepIndex`: the
 * special step sits at one end and the rest snap, so a range lowered under the
 * stored figure leaves the knob on a rung the request is also clamped to.
 */
export function gradientFarStepIndex(
  steps: (number | null)[],
  farKm: number | null,
): number {
  return farKm === null
    ? 0
    : nearestStep(steps.slice(1) as number[], farKm) + 1;
}

const STOP_RE = /((r)gba?\([^)]+\))\s+(\d+(?:\.\d+)?)%/gi;

/**
 * The stops of a CSS ramp, and which one the picker has selected. `null` where
 * the value is a plain colour, which is how the solid tab answers.
 */
export function cssToStops(
  css: string,
): { stops: PanoramaGradientStop[]; active?: number } | null {
  if (!css.startsWith('linear-gradient(')) {
    return null;
  }

  let active: number | undefined;

  const stops = [...css.matchAll(STOP_RE)].map(([, rgba, r, pct], i) => {
    if (r === 'R') {
      active = i;
    }

    // Sliced, not trusted: the opacity slider is hidden, but a hand-made value
    // carrying alpha would otherwise reach the wire as an eight-digit colour.
    return {
      pos: Number(pct) / 100,
      color: rgbaStringToHexa(rgba).slice(0, 7),
    };
  });

  return stops.length < 2 ? null : { stops, active };
}

/** What the wire calls it; see the service's `docs/API.md`. */
export type GroundGradientRequest = {
  far_distance: number | 'auto';
  clip: boolean;
  stops: [number, string][];
};

/** `pinnedFarM` overrides the setting with a distance a previous pass measured. */
export function gradientRequest(
  gradient: PanoramaGradient,
  rangeM: number,
  pinnedFarM?: number | null,
): GroundGradientRequest {
  const stops = normalizeStops(gradient.stops);

  const farM = pinnedFarM ?? (gradient.farKm && gradient.farKm * 1000);

  return {
    // Never past `range`: the service refuses a ramp ending beyond anything the
    // render can draw, and a lapsed account's range shrinks under a far
    // distance stored while it was premium's.
    far_distance: farM ? Math.min(farM, rangeM) : 'auto',
    clip: gradient.clip,
    stops: stops.map(({ pos, color }, i) => [
      pos,
      gradient.fadeToSky && i === stops.length - 1 ? 'sky' : color,
    ]),
  };
}

/** The service's own bounds; a list outside them is a 400 on every render. */
export const PanoramaGradientStopsSchema = z
  .array(z.object({ pos: z.number().min(0).max(1), color: z.string() }))
  .min(2)
  .max(GRADIENT_MAX_STOPS);

export const PanoramaGradientSchema = z.object({
  stops: PanoramaGradientStopsSchema,
  fadeToSky: z.boolean(),
  farKm: z
    .number()
    .positive()
    .max(GRADIENT_FAR_STEPS_KM[GRADIENT_FAR_STEPS_KM.length - 1])
    .nullable(),
  clip: z.boolean(),
});

/** What a ramp is, for the render key and for comparing two of them. */
export function gradientKey(gradient: PanoramaGradient | null): string {
  return gradient
    ? [
        gradient.farKm ?? 'auto',
        gradient.clip,
        gradient.fadeToSky,
        stopsKey(gradient.stops),
      ].join(' ')
    : '';
}

/**
 * What the near ground is painted in, which is what the map's marks are inked
 * in. The nearest stop rather than the first, since a stored list out of order
 * would otherwise ink the map in the colour of the far horizon. Returns a
 * string off the stop it finds: a selector reads this per action, and anything
 * newly allocated would re-render the map every time.
 */
export function panoramaGroundInk(
  color: string,
  gradient: PanoramaGradient | null,
): string {
  return (
    gradient?.stops.reduce(
      (nearest, stop) => (stop.pos < nearest.pos ? stop : nearest),
      gradient.stops[0],
    )?.color ?? color
  );
}
