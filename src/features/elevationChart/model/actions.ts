import { ElevationProfilePoint } from '@features/elevationChart/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';
import { Feature, LineString } from 'geojson';

export const elevationChartSetTrackGeojson = createAction<Feature<LineString>>(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
);

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

export const elevationChartSetActivePoint =
  createAction<ElevationProfilePoint | null>(
    'ELEVATION_CHART_SET_ACTIVE_POINT',
  );

export const elevationChartSetElevationProfile = createAction<
  ElevationProfilePoint[]
>('ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS');
