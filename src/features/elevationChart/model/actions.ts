import type {
  ElevationProfilePoint,
  ElevationProfileWaypoint,
} from '@features/elevationChart/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';
import type { Feature, LineString, MultiLineString } from 'geojson';
import type { ElevationSettingsState } from './settingsReducer.js';

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
 * sampled. Only the feature's owner knows both, so it states them when opening
 * the chart; the chart's own sampling adds whatever it reads itself.
 */
export type ElevationCredit = {
  provenance: ElevationProvenance;
  sources?: string[];
};

export const elevationChartSetTrackGeojson = createAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
  // `keepRecorded` renders the feature's own elevation as-is (with gaps where
  // it's missing) instead of sampling a complete profile from the server. A
  // `MultiLineString` is a multi-segment recording (an interrupted track): its
  // segments are laid end-to-end on the distance axis with a break between them.
  // `waypoints` are points (e.g. GPX <wpt>) to mark along the profile.
  // `credit` says what to credit the drawn elevation to; a resampled profile is
  // ours by construction (and names its own sources), while a feature's own
  // values default to uncredited until its owner says otherwise.
  (
    trackGeojson: Feature<LineString | MultiLineString>,
    keepRecorded = false,
    waypoints: ElevationWaypoint[] = [],
    credit: ElevationCredit = {
      provenance: keepRecorded ? 'recorded' : 'terrain-model',
    },
  ) => ({
    payload: { trackGeojson, keepRecorded, waypoints, credit },
  }),
);

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

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
  /**
   * Terrain-model tokens the elevation API reported for the points behind this
   * profile — see `elevationSourcesFromTokens`. Empty when it named none (the
   * elevation came from the feature itself, or the API doesn't report them), in
   * which case the profile credits nobody.
   */
  sources: string[];
}>('ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS');
