import {
  ElevationProfilePoint,
  ElevationProfileWaypoint,
} from '@features/elevationChart/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';
import { Feature, LineString, MultiLineString } from 'geojson';

/** A waypoint to pair onto the profile (by time, else nearest track point). */
export interface ElevationWaypoint {
  lat: number;
  lon: number;
  label?: string;
  /** ISO timestamp, when the source carries one (GPX `<wpt><time>`). */
  time?: string;
}

export const elevationChartSetTrackGeojson = createAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
  // `keepRecorded` renders the feature's own elevation as-is (with gaps where
  // it's missing) instead of sampling a complete profile from the server. A
  // `MultiLineString` is a multi-segment recording (an interrupted track): its
  // segments are laid end-to-end on the distance axis with a break between them.
  // `waypoints` are points (e.g. GPX <wpt>) to mark along the profile.
  (
    trackGeojson: Feature<LineString | MultiLineString>,
    keepRecorded = false,
    waypoints: ElevationWaypoint[] = [],
  ) => ({
    payload: { trackGeojson, keepRecorded, waypoints },
  }),
);

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

export const elevationChartSetActivePoint =
  createAction<ElevationProfilePoint | null>(
    'ELEVATION_CHART_SET_ACTIVE_POINT',
  );

export const elevationChartSetElevationProfile = createAction<{
  points: ElevationProfilePoint[];
  waypoints: ElevationProfileWaypoint[];
}>('ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS');
