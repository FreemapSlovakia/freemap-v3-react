import { createAction } from 'typesafe-actions';
import { ElevationProfilePoint } from 'fm3/reducers/elevationChartReducer';
import { GeoJsonObject } from 'geojson';

export const elevationChartSetTrackGeojson = createAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
)<GeoJsonObject>();

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE')();

export const elevationChartSetActivePoint = createAction(
  'ELEVATION_CHART_SET_ACTIVE_POINT',
)<ElevationProfilePoint>();

export const elevationChartSetElevationProfile = createAction(
  'ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS',
)<ElevationProfilePoint[]>();

export const elevationChartRemoveActivePoint = createAction(
  'ELEVATION_CHART_REMOVE_ACTIVE_POINT',
)();
