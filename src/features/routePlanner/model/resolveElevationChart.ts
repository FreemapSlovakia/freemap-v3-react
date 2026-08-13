import type { ProfileResolver } from '@features/elevationChart/model/resolve.js';
import { isPremium } from '@features/premium/premium.js';
import { readElevationSources } from '@shared/elevation.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import { lineString } from '@turf/helpers';
import { ensureRouteRenderGeojson } from './ensureRouteRenderGeojson.js';

/** The active alternative, as the densified DEM line where one is cached. */
const resolve: ProfileResolver = async (getState, dispatch) => {
  // Build the densified DEM render line so the chart isn't a coarse
  // straight-segment profile; a failure (e.g. offline) falls back to the
  // route's own coordinates.
  await ensureRouteRenderGeojson(getState, dispatch).catch(() => undefined);

  const { alternatives, activeAlternativeIndex, renderGeojson, points } =
    getState().routePlanner;

  const alternative = alternatives[activeAlternativeIndex];

  const fallbackCoords = alternative
    ? alternative.legs
        .flatMap((leg) => leg.steps)
        .flatMap((step) => step.geometry.coordinates)
    : [];

  const trackGeojson =
    renderGeojson ??
    (fallbackCoords.length >= 2 ? lineString(fallbackCoords) : null);

  if (!trackGeojson) {
    const { mode, points } = getState().routePlanner;

    // Every change to the route clears the old one before the new one arrives —
    // switching transport type, moving a waypoint — so an absent route while
    // enough waypoints stand means "being recomputed", not "deleted". Isochrone
    // mode draws areas, so it never produces a line at all.
    return mode !== 'isochrone' &&
      points.length >= (mode === 'roundtrip' ? 1 : 2)
      ? { status: 'pending' }
      : { status: 'gone' };
  }

  // Which model the profile's elevation belongs to: premium overrides every
  // vertex from our terrain model, and a router that returns none at all
  // (manual, OSRM) has its coordinates filled from it too — only GraphHopper's
  // own values, kept on the free tier, are Sonny's. The sources ride on the
  // render line, so they survive its cache being reused.
  const provenance =
    isPremium(getState().auth.user) ||
    transportTypeDefs[getState().routePlanner.transportType].api !== 'gh'
      ? 'terrain-model'
      : 'sonny';

  return {
    status: 'ok',
    source: {
      trackGeojson,
      // Render the line's coordinates as-is rather than resampling a fresh
      // server profile.
      keepRecorded: true,
      // Mark the intermediate route points along the profile; the start and
      // finish are the chart's own endpoints, so they're omitted.
      waypoints: points.slice(1, -1).map(({ lat, lon }) => ({ lat, lon })),
      credit: { provenance, sources: readElevationSources(trackGeojson) },
    },
  };
};

export default resolve;
