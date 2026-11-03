import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';

export const setSelectingHomeLocation = createAction<LatLon | boolean>(
  'SET_SELECTING_HOME_LOCATION',
);

/** Sets the home location, or with `null` removes it; kept on the account too. */
export const saveHomeLocation = createAction<LatLon | null>(
  'SAVE_HOME_LOCATION',
);

/** The account holds this home location now. */
export const homeLocationSent = createAction<LatLon | null>(
  'HOME_LOCATION_SENT',
);
