import type { LatLon } from '@shared/types/common.js';
import type { PanoramaRequest } from './api.js';
import type { PanoramaSettingsState } from './model/settingsReducer.js';

/** Coarsest to finest; the order the menu offers them in. */
export const PANORAMA_QUALITY_ORDER = [
  'superfast',
  'fast',
  'standard',
  'detailed',
  'finest',
] as const;

export type PanoramaQuality = (typeof PANORAMA_QUALITY_ORDER)[number];

/** The finest tier an account without premium may have. */
const FREE_QUALITY: PanoramaQuality = 'superfast';

/**
 * What the two-pass render draws first: the cheapest tier there is, so a
 * picture to look around in arrives in about a second whatever was asked for.
 */
export const PANORAMA_PREVIEW_QUALITY: PanoramaQuality = 'superfast';

/**
 * What each quality asks the renderer for, and roughly what a full turn costs.
 *
 * Time is about linear in `supersample_x / step`, so the tiers step along one
 * of those two and nothing else. **`supersample_y` is 9 throughout**: it costs
 * no extra rays, only buffer, and it decides which of several ridges sharing an
 * output pixel survive — which is to say it has a say in which peaks the
 * service calls visible. Free detail is not a tier.
 *
 * The service clamps what an account may ask for, so these are what to ask, not
 * what will be granted.
 */
export const PANORAMA_QUALITIES: Record<
  PanoramaQuality,
  {
    request: Pick<PanoramaRequest, 'step' | 'supersample_x' | 'supersample_y'>;
    /** Roughly what a 360° render takes, so a wait has something to fill. */
    expectedMs: number;
  }
> = {
  // One ray per column: ridges come out jagged and the picture is coarse,
  // which for a first look around is a fair trade for arriving in about a
  // second.
  superfast: {
    request: { step: 0.2, supersample_x: 1, supersample_y: 9 },
    expectedMs: 1500,
  },
  fast: {
    request: { step: 0.1, supersample_x: 3, supersample_y: 9 },
    expectedMs: 5000,
  },
  standard: {
    request: { step: 0.05, supersample_x: 3, supersample_y: 9 },
    expectedMs: 9000,
  },
  detailed: {
    request: { step: 0.05, supersample_x: 9, supersample_y: 9 },
    expectedMs: 27000,
  },
  finest: {
    request: { step: 0.033, supersample_x: 9, supersample_y: 9 },
    expectedMs: 41000,
  },
};

/**
 * What the account may actually have of what it asked for. Everything past
 * {@link FREE_QUALITY} is premium's; the service clamps it too, so this only
 * keeps the request and what the menu shows from claiming otherwise. Asking for
 * *less* is nobody's business to prevent.
 */
export function grantedQuality(
  asked: PanoramaQuality,
  premium: boolean,
): PanoramaQuality {
  return premium ||
    PANORAMA_QUALITY_ORDER.indexOf(asked) <=
      PANORAMA_QUALITY_ORDER.indexOf(FREE_QUALITY)
    ? asked
    : FREE_QUALITY;
}

export type PanoramaTilt = 'standard' | 'wide' | 'flat' | 'custom';

/** Degrees below and above horizontal each tilt preset frames. */
export const PANORAMA_TILTS: Record<
  Exclude<PanoramaTilt, 'custom'>,
  [number, number]
> = {
  standard: [-18, 12],
  wide: [-30, 25],
  flat: [-6, 6],
};

/** The frame a settings state asks for, whichever way it says it. */
export function tiltRange(settings: PanoramaSettingsState): [number, number] {
  return settings.tilt === 'custom'
    ? [settings.altMin, settings.altMax]
    : PANORAMA_TILTS[settings.tilt];
}

/** The service's cap on `width × height`, which it answers 400 to. */
const MAX_PANORAMA_PIXELS = 24_000_000;

/**
 * Degrees per pixel to ask for: the tier's own, unless a full turn over this
 * vertical band would exceed the pixel cap, in which case the finest step that
 * fits.
 *
 * The cap binds a wide band before a narrow one — `360 × band / step²` pixels —
 * so the tilt setting, not the quality alone, decides how fine a render may be.
 * Rounded up to a thousandth, which keeps a rounding-up of `width` and `height`
 * at the far end from putting the request back over.
 */
export function panoramaStep(
  quality: PanoramaQuality,
  [altMin, altMax]: [number, number],
): number {
  const finest = Math.sqrt((360 * (altMax - altMin)) / MAX_PANORAMA_PIXELS);

  return Math.max(
    PANORAMA_QUALITIES[quality].request.step,
    Math.ceil(finest * 1000) / 1000,
  );
}

/**
 * Metres a summit must stand above the ground around it to be returned, low
 * enough to be no filter at all — dominance is **signed**, so a top that never
 * rises clear of its own ridge scores how far the ridge stands over it, and a
 * floor of `0` would drop exactly the near-field tops a panorama most wants
 * named. Deeper than any real terrain, so nothing is cut.
 *
 * How many names are shown is decided against the viewport instead, where a
 * change is instant; re-rendering to reveal one more label would be absurd.
 */
const MIN_DOMINANCE_M = -100_000;

/**
 * A bound on the payload, not on what is drawn — the view decides how many
 * names it has room for, and asking again to reveal one more would cost a whole
 * render. Set well above what any panel can hold: a rich summit answers with
 * the better part of a thousand, and at a few hundred bytes each that is
 * nothing beside the picture they belong to. The cut is applied after the sort,
 * so what it does drop is what dominates the view least.
 */
const MAX_PEAKS = 2000;

export function buildPanoramaRequest(
  viewpoint: LatLon,
  settings: PanoramaSettingsState,
  quality: PanoramaQuality,
): PanoramaRequest {
  const range = tiltRange(settings);

  return {
    lon: viewpoint.lon,
    lat: viewpoint.lat,
    fov: 360,
    alt_min: range[0],
    alt_max: range[1],
    eye: settings.eye,
    depth: true,
    depth_step: 4,
    peaks: true,
    min_dominance: MIN_DOMINANCE_M,
    max_peaks: MAX_PEAKS,
    ...PANORAMA_QUALITIES[quality].request,
    step: panoramaStep(quality, range),
  };
}

/**
 * What a render is of. The panel compares it against the current viewpoint and
 * settings to know whether what's on screen still answers for them, so nothing
 * has to track a "dirty" flag through every control.
 */
export function panoramaRenderKey(
  viewpoint: LatLon,
  settings: PanoramaSettingsState,
  quality: PanoramaQuality,
): string {
  const [altMin, altMax] = tiltRange(settings);

  return [
    viewpoint.lat.toFixed(6),
    viewpoint.lon.toFixed(6),
    altMin,
    altMax,
    settings.eye,
    quality,
  ].join('/');
}
