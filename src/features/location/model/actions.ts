import { createAction } from '@reduxjs/toolkit';

export const setLocation = createAction<{
  lat: number;
  lon: number;
  accuracy: number;
}>('SET_LOCATION');

export const toggleLocate = createAction<boolean | undefined>('LOCATE');
