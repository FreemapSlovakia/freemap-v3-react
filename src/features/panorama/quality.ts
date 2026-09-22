import { mod } from '@shared/mathUtils.js';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaRequest, PeakRankExpression } from './api.js';
import { gradientRequest } from './gradient.js';
import { PROM_DOUBTED_TRUST, PROM_TRUSTED_M } from './labels/fromPeaks.js';
import {
  ALT_LIMIT,
  isFullTurn,
  type PanoramaSettingsState,
  panoramaSettingsInitialState,
  panoramaStyleKey,
  tiltRange,
} from './model/settingsReducer.js';

/**
 * How fine a picture to render, in pixels per degree — the one thing a quality
 * tier used to bundle, everything else about a render following from it.
 *
 * These are the stops the Detail slider offers, coarsest first. Absolute, so
 * one of them means the same picture in every frame; {@link DETAIL_MAX} is the
 * stop that moves with the frame instead.
 */
const DETAIL_STOPS = [5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150] as const;

/** As fine as this frame allows, which the fov and the band decide. */
export const DETAIL_MAX = 'max';

export type PanoramaDetail = number | typeof DETAIL_MAX;

/**
 * Rays per pixel across, which is **derived, not chosen**.
 *
 * The service casts this many rays per output column and box-averages them, so
 * it is antialiasing: with one, a column is a single bearing and anything
 * narrower than it — a rib, a tower, every slanted edge — is either there whole
 * or not at all. Two things escape the averaging and are the reason it is not
 * merely cosmetic: the distance buffer takes the *nearest* sub-sample rather
 * than the mean, and a summit's visibility is answered by the rays bracketing
 * its bearing.
 *
 * What it is worth therefore depends on how wide a column is. Below
 * {@link TARGET_RAYS_PER_DEG} the picture is coarser than the 6 m pyramid
 * resolves at the distances that matter, so averaging finds something; at or
 * past it a pixel is already one DEM cell and more rays re-sample the same
 * ground — which is why ×1 and ×9 are the same picture at a fine detail.
 */
const TARGET_RAYS_PER_DEG = 60;

/** Never more than this, the returns having flattened well before it. */
const RAYS_MAX_PER_PX = 3;

/**
 * Under this the picture is the quick look, and deliberately rough: it is what
 * a free account renders, and sampling it properly would cost three times the
 * rays of the one render that has to be cheap.
 */
const RAYS_COARSE_BELOW_PX = 10;

function raysForDetail(pxPerDeg: number): number {
  return pxPerDeg < RAYS_COARSE_BELOW_PX
    ? 1
    : Math.min(
        Math.max(Math.round(TARGET_RAYS_PER_DEG / pxPerDeg), 1),
        RAYS_MAX_PER_PX,
      );
}

/**
 * Rays a render may cost without premium. Exactly what a full turn at the
 * coarsest stop has always cost, so nothing an account had is taken away — but
 * the budget is now spent rather than assumed, and a narrow slice, being cheap
 * in rays, buys detail with it.
 */
const FREE_RAYS = 1800;

/**
 * Sub-rows per pixel, never a setting: they cost no rays, only buffer, and they
 * decide which of several ridges sharing an output pixel survives — which is to
 * say they have a say in which peaks the service calls visible. Free detail.
 */
const SUPERSAMPLE_Y = 9;

/**
 * The service's two caps, each a 400 of its own — `width × height` for how big
 * the answer is, `width × supersample_x` for how long it takes. They are the
 * service's `MAX_PIXELS` and `MAX_RAYS`; raising them there without raising
 * them here only leaves detail unasked for, the other way round is a 400.
 */
const MAX_PANORAMA_PIXELS = 24_000_000;
const MAX_PANORAMA_RAYS = 162_000;

/**
 * What the *browser* can carry, which is the binding cap on a wide frame and
 * far below the service's. Every output pixel costs four bytes decoded, two
 * more in the distance buffer, and two more again in the worker that inflates
 * it — so the service's own cap is a quarter-gigabyte here, which froze the
 * tab for seconds and then killed it. Raise only against a real measurement.
 */
const MAX_CLIENT_PIXELS = 10_000_000;

/** The service's `MIN_STEP`: finer than the 6 m pyramid has to say. */
const SERVICE_MIN_STEP = 0.005;

/**
 * How far an account without premium may see, kilometres — the service's own
 * default, so this is what every render held before the control existed.
 * Farther costs samples on every ray of the picture.
 */
export const FREE_RANGE_MAX_KM = 300;

/** Asking for *less* is nobody's business to stop. */
export function grantedRangeKm(asked: number, premium: boolean): number {
  return premium ? asked : Math.min(asked, FREE_RANGE_MAX_KM);
}

/** The frame a request will carry, as against the one the settings read as. */
interface RenderFrame {
  fovDeg: number;
  altMin: number;
  altMax: number;
}

/**
 * What the render will actually be of. One value rather than a fov and a band
 * fetched separately: every caller needs both, and taking half of the pair —
 * the raised band with the asked-for fov, or the reverse — prices and grants a
 * frame the request does not ask for.
 *
 * A depth lift raises the horizon by exactly its own degrees, so the same is
 * added on top: without it the far ridges the lift exists to separate climb
 * straight out of an unchanged frame.
 */
function renderFrame(settings: PanoramaSettingsState): RenderFrame {
  const [altMin, altMax] = tiltRange(settings);

  return {
    fovDeg: settings.fovDeg,
    altMin,
    altMax: Math.min(altMax + settings.depthLift, ALT_LIMIT),
  };
}

/**
 * The finest this frame can be rendered at, pixels per degree, at this
 * sampling — the Detail slider's top stop, and what {@link DETAIL_MAX} means.
 *
 * Three caps decide it, and which one binds moves with the frame. Pixels run
 * with `fov × band / step²`, so halving the fov buys a factor of √2; rays run
 * with `fov × rays / step`, so it buys the whole half. The tilt and the fov
 * therefore decide how fine a render may be as much as the setting does —
 * which is why they are all in the render key.
 *
 * Each cap is asked for a thousandth short: the service rounds `width` and
 * `height` *up* before checking them, so a step that exactly fits comes back a
 * 400.
 */
function maxPxPerDeg({ fovDeg, altMin, altMax }: RenderFrame): number {
  const margin = 1.001;

  const pixels = Math.min(MAX_PANORAMA_PIXELS, MAX_CLIENT_PIXELS);

  const band = altMax - altMin;

  const step = Math.max(
    SERVICE_MIN_STEP,
    margin * Math.sqrt((fovDeg * band) / pixels),
    // At the most rays any detail is granted, so the ceiling does not move as
    // the derived sampling steps up under it.
    (margin * (fovDeg * RAYS_MAX_PER_PX)) / MAX_PANORAMA_RAYS,
  );

  return 1 / step;
}

/** What the account may actually have of the three settings it can overreach on. */
export interface PanoramaGrants {
  /** Pixels per degree the request will carry, already inside every cap. */
  pxPerDeg: number;
  raysPerPixel: number;
  rangeKm: number;
}

export function grantedPanorama(
  settings: PanoramaSettingsState,
  premium: boolean,
): PanoramaGrants {
  const stops = panoramaDetailStops(settings, premium);

  const ceiling = grantedCeiling(settings, premium);

  // Down to a stop the budget will pay for, not merely under the ceiling: the
  // affordable set has gaps, so a stored 40 sits below a granted 50 and is
  // still over. Reachable after premium lapses, like the range.
  const asked = settings.detail;

  const pxPerDeg =
    asked === DETAIL_MAX
      ? ceiling
      : (stops.filter((px) => px <= asked).at(-1) ?? Math.min(asked, ceiling));

  return {
    pxPerDeg,
    raysPerPixel: raysForDetail(pxPerDeg),
    rangeKm: grantedRangeKm(settings.rangeKm, premium),
  };
}

/**
 * The stops this frame and this account may render at — what the Detail slider
 * offers, and where {@link grantedCeiling} reads its answer.
 *
 * Filtered rather than bounded, because the affordable set is not a prefix:
 * {@link raysForDetail} steps down partway along the scale, so at a 30° slice
 * 40 px/° costs more rays than 50 does. Anything testing `px <= ceiling`
 * instead sells a stop the budget cannot pay for.
 */
export function panoramaDetailStops(
  settings: PanoramaSettingsState,
  premium: boolean,
): number[] {
  const frame = renderFrame(settings);

  const ceiling = maxPxPerDeg(frame);

  return DETAIL_STOPS.filter(
    (px) =>
      px <= ceiling &&
      (premium || frame.fovDeg * px * raysForDetail(px) <= FREE_RAYS),
  );
}

/**
 * The finest this account may render this frame — what {@link DETAIL_MAX}
 * resolves to. Premium is held only by the frame, which is not a stop; free is
 * held to the last stop {@link FREE_RAYS} affords.
 */
export function grantedCeiling(
  settings: PanoramaSettingsState,
  premium: boolean,
): number {
  const ceiling = maxPxPerDeg(renderFrame(settings));

  if (premium) {
    return ceiling;
  }

  // Nothing affordable means a frame so wide that even the coarsest stop is
  // over — rather than no picture at all, it renders the coarsest.
  return (
    panoramaDetailStops(settings, premium).at(-1) ??
    Math.min(ceiling, DETAIL_STOPS[0])
  );
}

/**
 * Milliseconds per ray, and what a render costs before it marches any. Fitted
 * to the measured figures — 1.5 / 5 / 9 / 27 / 41 s for a full turn at 5 / 10 /
 * 20 / 20×9 / 30 px per degree, peaks and depth included — which the ray count
 * alone explains to within a tenth.
 */
const RAY_MS = 0.41;
const RENDER_OVERHEAD_MS = 700;

/**
 * And what the picture costs *here*, per megapixel, once the server is done:
 * a 10-bit AVIF to decode and a distance buffer to inflate, then the viewer
 * scaling the result to the panel. Measured on one 10 Mpx render, which took
 * about fifteen seconds of it — five with the tab alive and ten without.
 *
 * In the same figure as the render, because the wait is one wait: the progress
 * bar reaching 100% and the picture appearing are not the same moment, and a
 * menu that priced only the server's half said 2 s for something that took
 * nearer twenty.
 */
const CLIENT_MS_PER_MPX = 1500;

/**
 * Roughly how long from pressing Update to having a picture, so a wait has
 * something to fill and a menu can price what it offers.
 *
 * The render runs with the rays the marcher casts, `fov × pxPerDeg × rays`, so
 * a narrow slice is cheaper at the same detail — and a short band is not, the
 * band deciding the picture's height and every column costing the same to
 * march however few rows it fills. What follows on this side runs with the
 * pixels instead, which is what a tall band does add.
 */
export function panoramaExpectedMs(
  pxPerDeg: number,
  settings: PanoramaSettingsState,
): number {
  // The frame the request will ask for, not the one the settings read as: a
  // depth lift grows the band, and pricing the unlifted one under-quotes it.
  const { fovDeg, altMin, altMax } = renderFrame(settings);

  const bandDeg = altMax - altMin;

  const rays = Math.round(fovDeg * pxPerDeg) * raysForDetail(pxPerDeg);

  const megapixels = (fovDeg * pxPerDeg * bandDeg * pxPerDeg) / 1e6;

  return RENDER_OVERHEAD_MS + rays * RAY_MS + megapixels * CLIENT_MS_PER_MPX;
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
 * `renderAz` is the bearing the middle of the slice faces; a full turn ignores
 * it, having no direction to face.
 */
export function buildPanoramaRequest(
  viewpoint: LatLon,
  settings: PanoramaSettingsState,
  { pxPerDeg, raysPerPixel, rangeKm }: PanoramaGrants,
  renderAz: number,
): PanoramaRequest {
  const { fovDeg: fov, altMin, altMax } = renderFrame(settings);

  const gradient = settings.groundGradient;

  return {
    lon: viewpoint.lon,
    lat: viewpoint.lat,
    fov,
    // The wire wants the left edge; a full turn starts wherever the service
    // likes, and saying so would only pin it for nothing.
    ...(isFullTurn(fov) ? {} : { az: mod(renderAz - fov / 2, 360) }),
    alt_min: altMin,
    alt_max: altMax,
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
    // One or the other: a gradient replaces the blend rather than feeding it,
    // so `ground_color` beside it would only say something untrue.
    ...(gradient
      ? {
          ground_gradient: gradientRequest(gradient, rangeKm * 1000),
        }
      : { ground_color: settings.groundColor }),
    depth_lift: settings.depthLift,
    // The wire's own way round; the grant is already inside every cap.
    step: 1 / pxPerDeg,
    supersample_x: raysPerPixel,
    supersample_y: SUPERSAMPLE_Y,
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
  { pxPerDeg, raysPerPixel, rangeKm }: PanoramaGrants,
  renderAz: number,
): string {
  const [altMin, altMax] = tiltRange(settings);

  return [
    viewpoint.lat.toFixed(6),
    viewpoint.lon.toFixed(6),
    altMin,
    altMax,
    settings.fovDeg,
    // Only a slice faces anywhere. In the key because it is staged like the
    // viewpoint — the wedge says where and Update pays — unlike the bearing the
    // viewer is turned to, which rearranges the picture in hand and is free.
    isFullTurn(settings.fovDeg) ? '' : Math.round(renderAz),
    settings.eye,
    // Its own entry rather than the raised band: a lift of 1 over a 12° top
    // asks for a different picture than none over 13°.
    settings.depthLift,
    // The granted figure, not the asked-for one: a free account that stored a
    // farther view is rendering the same picture it was before.
    rangeKm,
    // Granted too, and rounded the way the request is: `max` resolves against
    // this very frame, so the stored setting would say nothing about what is
    // on screen.
    pxPerDeg.toFixed(2),
    raysPerPixel,
    // The look is asked for, not applied afterwards, so changing it is another
    // render — and the Update button has to say so.
    panoramaStyleKey(settings),
  ].join('/');
}
