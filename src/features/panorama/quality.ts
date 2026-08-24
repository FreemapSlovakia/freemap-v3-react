import type { LatLon } from '@shared/types/common.js';
import type { PanoramaRequest, PeakRankExpression } from './api.js';
import { PROM_DOUBTED_TRUST, PROM_TRUSTED_M } from './labels/fromPeaks.js';
import {
  ALT_LIMIT,
  type PanoramaSettingsState,
  panoramaSettingsInitialState,
  tiltRange,
} from './model/settingsReducer.js';

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

/**
 * How far an account without premium may see, kilometres — the service's own
 * default, so this is what every render held before the control existed.
 * Farther costs samples on every ray of the picture.
 */
export const FREE_RANGE_MAX_KM = 300;

/** As {@link grantedQuality}: asking for *less* is nobody's business to stop. */
export function grantedRangeKm(asked: number, premium: boolean): number {
  return premium ? asked : Math.min(asked, FREE_RANGE_MAX_KM);
}

/** What the account may actually have of the two settings it can overreach on. */
export interface PanoramaGrants {
  quality: PanoramaQuality;
  rangeKm: number;
}

export function grantedPanorama(
  settings: PanoramaSettingsState,
  premium: boolean,
): PanoramaGrants {
  return {
    quality: grantedQuality(settings.quality, premium),
    rangeKm: grantedRangeKm(settings.rangeKm, premium),
  };
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
 * How many peaks to keep. It does bind — a Tatra summit answers with 6055 — and
 * what it drops is chosen by {@link PEAK_RANK}, whose weights are the defaults
 * rather than the user's, so in principle someone at an end of *Rank peaks by*
 * could be served a set truncated by an ordering they had moved away from, with
 * no way to ask for the rest.
 *
 * Measured rather than assumed: of the 1055 that cap drops from that view, none
 * reaches the top 200 under either extreme of either slider. They are deeply
 * negative dominance at distance, which is the bottom of every ordering, not
 * just the default one. Raise this if that ever stops being true; at 59 B a
 * peak on the wire the headroom is cheap.
 */
const MAX_PEAKS = 5000;

/** `distance`, floored at 1 m, which is what the whole total is divided by. */
const DISTANCE: PeakRankExpression = ['max', ['get', 'distance'], 1];

/**
 * `1 / distance ** p` at the **default** exponent — read from the initial state
 * rather than restated, so retuning that default cannot leave the request
 * ordering by a number nobody chose.
 */
const CUT_WORTH: PeakRankExpression = [
  '/',
  1,
  ['^', DISTANCE, panoramaSettingsInitialState.labelDistanceWeight],
];

/** Dominance and prominence summed, as `labelRank` sums them, at the defaults. */
const CUT_STATURE: PeakRankExpression = [
  '+',
  ['get', 'dominance'],
  [
    '*',
    panoramaSettingsInitialState.prominenceWeight,
    ['coalesce', ['get', 'prominence'], 0],
    [
      'case',
      ['<=', ['coalesce', ['get', 'prom_dist_m'], 1e9], PROM_TRUSTED_M],
      1,
      PROM_DOUBTED_TRUST,
    ],
  ],
];

/**
 * What the service should order by before it cuts. `labelRank`'s two terms —
 * dominance with its sign rule, plus prominence discounted by how far its match
 * reached — with every part the user can move fixed at its default: the haze
 * term and the revealed penalty are left out, and the distance and prominence
 * weights are the defaults rather than the current settings.
 *
 * All of those move without a render. Baking the current haze into the cut
 * would have the service drop the far giants that "clear air" exists to reveal,
 * and the slider that reveals them cannot ask for another render. So the
 * request ranks on what could ever be wanted and the viewer ranks on what is
 * wanted now; the constants are shared with `labelRank` so the two cannot
 * drift.
 */
const PEAK_RANK: PeakRankExpression = [
  '*',
  CUT_STATURE,
  ['^', CUT_WORTH, ['sign', CUT_STATURE]],
];

/**
 * The band actually asked for. A depth lift raises the horizon by exactly its
 * own degrees, so the same is added on top: without it the far ridges the lift
 * exists to separate climb straight out of an unchanged frame.
 */
function renderTiltRange(settings: PanoramaSettingsState): [number, number] {
  const [altMin, altMax] = tiltRange(settings);

  return [altMin, Math.min(altMax + settings.depthLift, ALT_LIMIT)];
}

export function buildPanoramaRequest(
  viewpoint: LatLon,
  settings: PanoramaSettingsState,
  { quality, rangeKm }: PanoramaGrants,
): PanoramaRequest {
  const band = renderTiltRange(settings);

  return {
    lon: viewpoint.lon,
    lat: viewpoint.lat,
    fov: 360,
    alt_min: band[0],
    alt_max: band[1],
    eye: settings.eye,
    range: rangeKm * 1000,
    depth: true,
    depth_step: 4,
    peaks: true,
    // No `peak_filter`: the service filters nothing of its own accord now, so
    // saying "keep everything" is saying nothing. Which summits count is
    // decided against the viewport instead, where a change is instant.
    max_peaks: MAX_PEAKS,
    peak_rank: PEAK_RANK,
    ridge_strength: settings.ridgeStrength,
    ridge_width: settings.ridgeWidth,
    ridge_color: settings.ridgeColor,
    ground_color: settings.groundColor,
    depth_lift: settings.depthLift,
    ...PANORAMA_QUALITIES[quality].request,
    step: panoramaStep(quality, band),
    format: 'avif',
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
  { quality, rangeKm }: PanoramaGrants,
): string {
  const [altMin, altMax] = tiltRange(settings);

  return [
    viewpoint.lat.toFixed(6),
    viewpoint.lon.toFixed(6),
    altMin,
    altMax,
    settings.eye,
    // Its own entry rather than the raised band: a lift of 1 over a 12° top
    // asks for a different picture than none over 13°.
    settings.depthLift,
    // The granted figure, not the asked-for one: a free account that stored a
    // farther view is rendering the same picture it was before.
    rangeKm,
    quality,
    // The look is asked for, not applied afterwards, so changing it is another
    // render — and the Update button has to say so.
    settings.ridgeStrength,
    settings.ridgeWidth,
    settings.ridgeColor,
    settings.groundColor,
  ].join('/');
}
