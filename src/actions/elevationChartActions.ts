import { createStandardAction, createAction } from 'typesafe-actions';

export const elevationChartSetTrackGeojson = createStandardAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
)<object>(); // TODO geojson

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

export const elevationChartSetActivePoint = createStandardAction(
  'ELEVATION_CHART_SET_ACTIVE_POINT',
)<any>();

export const elevationChartSetElevationProfile = createStandardAction(
  'ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS',
)<any[]>();

export const elevationChartRemoveActivePoint = createAction(
  'ELEVATION_CHART_REMOVE_ACTIVE_POINT',
);
