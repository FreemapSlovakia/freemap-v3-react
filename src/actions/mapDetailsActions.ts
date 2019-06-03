import { createStandardAction } from 'typesafe-actions';

export const mapDetailsSetSubtool = createStandardAction(
  'MAP_DETAILS_SET_SUBTOOL',
)<string>();

export const mapDetailsSetUserSelectedPosition = createStandardAction(
  'MAP_DETAILS_SET_USER_SELECTED_POSITION',
)<{ lat: number; lon: number }>();

export const mapDetailsSetTrackInfoPoints = createStandardAction(
  'MAP_DETAILS_SET_TRACK_INFO_POINTS',
)<any>();
