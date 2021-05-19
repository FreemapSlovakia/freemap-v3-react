import { createAction } from 'typesafe-actions';

export const mapDetailsSetUserSelectedPosition = createAction(
  'MAP_DETAILS_SET_USER_SELECTED_POSITION',
)<{ lat: number; lon: number }>();
