import { createStandardAction, createAction } from 'typesafe-actions';
import { IElevationProfilePoint } from 'fm3/reducers/elevationChartReducer';
import { GeoJsonObject } from 'geojson';

export const elevationChartSetTrackGeojson = createStandardAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
)<GeoJsonObject>();

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE');

export const elevationChartSetActivePoint = createStandardAction(
  'ELEVATION_CHART_SET_ACTIVE_POINT',
)<IElevationProfilePoint>();

export const elevationChartSetElevationProfile = createStandardAction(
  'ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS',
)<IElevationProfilePoint[]>();

export const elevationChartRemoveActivePoint = createAction(
  'ELEVATION_CHART_REMOVE_ACTIVE_POINT',
);
