import { Feature, LineString } from '@turf/helpers';
import { ElevationProfilePoint } from 'fm3/reducers/elevationChartReducer';
import { createAction } from 'typesafe-actions';

export const elevationChartSetTrackGeojson = createAction(
  'ELEVATION_CHART_SET_TRACK_GEOJSON',
)<Feature<LineString>>();

export const elevationChartClose = createAction('ELEVATION_CHART_CLOSE')();

export const elevationChartSetActivePoint = createAction(
  'ELEVATION_CHART_SET_ACTIVE_POINT',
)<ElevationProfilePoint | null>();

export const elevationChartSetElevationProfile = createAction(
  'ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS',
)<ElevationProfilePoint[]>();
