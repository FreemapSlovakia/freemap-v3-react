import { createAction } from 'typesafe-actions';

export const mapDetailsSetSubtool = createAction('MAP_DETAILS_SET_SUBTOOL')<
  string
>();

export const mapDetailsSetUserSelectedPosition = createAction(
  'MAP_DETAILS_SET_USER_SELECTED_POSITION',
)<{ lat: number; lon: number }>();

export const mapDetailsSetTrackInfoPoints = createAction(
  'MAP_DETAILS_SET_TRACK_INFO_POINTS',
)<any>();
