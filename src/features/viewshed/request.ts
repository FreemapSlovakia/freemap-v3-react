import type { LatLon } from '@shared/types/common.js';
import type { ViewshedRequest } from './api.js';
import {
  VIEWSHED_DETAIL_ORDER,
  VIEWSHED_DETAILS,
  type ViewshedDetail,
  type ViewshedSettingsState,
} from './model/settingsReducer.js';

/** The service's cap on `width × height`, which it answers 400 to. */
const MAX_VIEWSHED_PIXELS = 96_000_000;

/**
 * The pyramid's own finest level, and so the floor for every tier: the marcher
 * steps by DEM cell, which makes anything finer pixels carrying no information.
 */
const DATA_SCALE_M = 6;

/**
 * Fewest pixels a side worth drawing. A coarse tier over a short range would
 * otherwise come out at a few dozen pixels — 66 for the fastest at 1 km — which
 * reads as a broken overlay rather than a fast one.
 */
const MIN_SIDE_PX = 600;

/**
 * Ground metres per pixel to ask for: the tier's own resolution, held off the
 * data, the tier's pixel budget and a raster too small to read. Rounded up, so
 * the side the service derives from the pair cannot round back over the cap.
 */
export function viewshedScale(
  radiusKm: number,
  detail: ViewshedDetail,
): number {
  const across = radiusKm * 2000;

  const { scale, maxPixels } = VIEWSHED_DETAILS[detail];

  // The service's cap as well as the tier's, so a budget raised past what it
  // allows is still a request it accepts.
  const coarsest = across / Math.sqrt(Math.min(maxPixels, MAX_VIEWSHED_PIXELS));

  return (
    Math.ceil(
      Math.max(DATA_SCALE_M, Math.min(scale, across / MIN_SIDE_PX), coarsest) *
        100,
    ) / 100
  );
}

/** The finest tier an account without premium may have. */
export const FREE_DETAIL: ViewshedDetail = 'superfast';

/**
 * How far an account without premium may look, kilometres. Distance is what a
 * viewshed costs most: rays grow with the rim and each marches to the edge.
 */
export const FREE_RADIUS_MAX_KM = 20;

/**
 * What the account may actually have of what it asked for. The service does not
 * clamp this itself, so nothing but these two keeps the request honest; asking
 * for *less* is nobody's business to prevent.
 */
export function grantedDetail(
  asked: ViewshedDetail,
  premium: boolean,
): ViewshedDetail {
  return premium ||
    VIEWSHED_DETAIL_ORDER.indexOf(asked) <=
      VIEWSHED_DETAIL_ORDER.indexOf(FREE_DETAIL)
    ? asked
    : FREE_DETAIL;
}

export function grantedRadiusKm(asked: number, premium: boolean): number {
  return premium ? asked : Math.min(asked, FREE_RADIUS_MAX_KM);
}

/** What the account may actually have of the two settings it can overreach on. */
export interface ViewshedGrants {
  detail: ViewshedDetail;
  radiusKm: number;
}

export function grantedViewshed(
  settings: ViewshedSettingsState,
  premium: boolean,
): ViewshedGrants {
  return {
    detail: grantedDetail(settings.detail, premium),
    radiusKm: grantedRadiusKm(settings.radiusKm, premium),
  };
}

/**
 * Metres the eye is raised to the highest ground within. Wider than the
 * panorama's: Gerlach's nominal coordinates see a tenth of what its DEM maximum
 * 75 m away sees.
 */
const EYE_SEARCH_RADIUS_M = 30;

export function buildViewshedRequest(
  viewpoint: LatLon,
  settings: ViewshedSettingsState,
  { detail, radiusKm }: ViewshedGrants,
): ViewshedRequest {
  return {
    lon: viewpoint.lon,
    lat: viewpoint.lat,
    radius: radiusKm * 1000,
    scale: viewshedScale(radiusKm, detail),
    eye: settings.eye,
    eye_search_radius: EYE_SEARCH_RADIUS_M,
    target_height: settings.targetHeight,
    color: settings.color,
    gamma: settings.gamma,
    alpha_floor: settings.alphaFloor,
    // A flat wash under a smooth alpha, which AVIF packs to a third of what
    // PNG does — 119 KB against 319 for a 2000 px render.
    format: 'avif',
  };
}

/**
 * What a render is of. The toolbar compares it against the current viewpoint
 * and settings to know whether what's on the map still answers for them, so
 * nothing has to track a "dirty" flag through every control.
 */
export function viewshedRenderKey(
  viewpoint: LatLon,
  settings: ViewshedSettingsState,
  { detail, radiusKm }: ViewshedGrants,
): string {
  return [
    viewpoint.lat.toFixed(6),
    viewpoint.lon.toFixed(6),
    radiusKm,
    // The scale, not the tier: two tiers can come to the same one, and then
    // there is nothing to re-render for.
    viewshedScale(radiusKm, detail),
    settings.eye,
    settings.targetHeight,
    settings.color,
    // Asked for, not applied afterwards, so either is another render.
    settings.gamma,
    settings.alphaFloor,
  ].join('/');
}
