import { createAction } from '@reduxjs/toolkit';

export const mapDetailsSetUserSelectedPosition = createAction<{
  lat: number;
  lon: number;
}>('MAP_DETAILS_SET_USER_SELECTED_POSITION');
