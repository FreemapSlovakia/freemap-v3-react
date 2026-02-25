import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';

export const setSelectingHomeLocation = createAction<LatLon | boolean>(
  'SET_SELECTING_HOME_LOCATION',
);

export const saveHomeLocation = createAction('SAVE_HOME_LOCATION');
