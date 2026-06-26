import { ElevationProfilePoint } from '@features/elevationChart/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';
import { Feature, LineString, MultiLineString } from 'geojson';

export const elevationChartSetTrackGeojson = createAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
  // `keepRecorded` renders the feature's own elevation as-is (with gaps where
  // it's missing) instead of sampling a complete profile from the server. A
  // `MultiLineString` is a multi-segment recording (an interrupted track): its
  // segments are laid end-to-end on the distance axis with a break between them.
  (
    trackGeojson: Feature<LineString | MultiLineString>,
    keepRecorded = false,
  ) => ({
    payload: { trackGeojson, keepRecorded },
  }),
);

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

export const elevationChartSetActivePoint =
  createAction<ElevationProfilePoint | null>(
    'ELEVATION_CHART_SET_ACTIVE_POINT',
  );

export const elevationChartSetElevationProfile = createAction<
  ElevationProfilePoint[]
>('ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS');
