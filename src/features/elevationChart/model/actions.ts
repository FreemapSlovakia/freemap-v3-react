import type {
  ElevationProfilePoint,
  ElevationProfileWaypoint,
} from '@features/elevationChart/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';
import type { ElevationSettingsState } from './settingsReducer.js';
import type { ElevationChartTarget } from './target.js';

/** A waypoint to pair onto the profile (by time, else nearest track point). */
export interface ElevationWaypoint {
  lat: number;
  lon: number;
  label?: string;
  /** ISO timestamp, when the source carries one (GPX `<wpt><time>`). */
  time?: string;
}

/**
 * Which terrain model the elevation a profile draws came from, so the chart can
 * credit it:
 *
 * - `terrain-model` — sampled from our elevation API (a drawn line, a route
 *   whose vertices were overridden, a track the user had filled from the
 *   server), so it carries the national high-resolution models or GEDTM30.
 * - `srtm` — GraphHopper's own elevation, kept as the router returned it.
 * - `recorded` — the feature's own measured values (a GPS recording, an imported
 *   file), which no terrain model can be credited for.
 */
export type ElevationProvenance = 'terrain-model' | 'srtm' | 'recorded';

/**
 * What the chart may credit a profile's elevation to: where it came from, plus —
 * for `terrain-model` — the source tokens the elevation API named when it was
 * sampled. Only the feature being charted knows both, so its resolver states
 * them; the chart's own sampling adds whatever it reads itself.
 */
export type ElevationCredit = {
  provenance: ElevationProvenance;
  sources?: string[];
};

/**
 * Shows the chart on `target`. The geometry needn't exist yet: the chart is a
 * derived view, so `elevationChartProcessor` resolves the target against
 * current state — now, and again whenever what it resolves to changes.
 *
 * `fromUrl` marks a target restored from the URL rather than asked for by the
 * user — a page load is not a toggle, so it isn't reported as one. Whether to
 * wait for geometry that hasn't arrived is not decided here: the target's
 * resolver says whether it is still coming.
 */
export const elevationChartOpen = createAction(
  'ELEVATION_CHART_OPEN',
  (target: ElevationChartTarget, { fromUrl = false } = {}) => ({
    payload: { target, fromUrl },
  }),
);

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

/**
 * Redraw the current target now. Carries nothing and changes no state — it
 * exists so the chart's own debounce can hand work back to the processor
 * without awaiting a timer inside it, which would hold a progress indicator
 * open for the length of a drag.
 */
export const elevationChartRedraw = createAction('ELEVATION_CHART_REDRAW');

export const elevationChartSetActivePoint =
  createAction<ElevationProfilePoint | null>(
    'ELEVATION_CHART_SET_ACTIVE_POINT',
  );

export const elevationSetSettings = createAction<
  Partial<ElevationSettingsState>
>('ELEVATION_SET_SETTINGS');

export const elevationChartSetElevationProfile = createAction<{
  points: ElevationProfilePoint[];
  waypoints: ElevationProfileWaypoint[];
  /** What the drawn elevation is credited to; see {@link ElevationCredit}. */
  provenance: ElevationProvenance;
  /**
   * Terrain-model tokens the elevation API reported for the points behind this
   * profile — see `elevationSourcesFromTokens`. Empty when it named none (the
   * elevation came from the feature itself, or the API doesn't report them), in
   * which case the profile credits nobody.
   */
  sources: string[];
}>('ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS');
