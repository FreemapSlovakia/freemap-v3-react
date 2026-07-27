import { createAction } from '@reduxjs/toolkit';
import type { HeadingSource } from './settingsReducer.js';

export const setLocation = createAction<{
  lat: number;
  lon: number;
  accuracy: number;
  /** Course over ground in degrees clockwise from true north; `null` when unknown. */
  heading: number | null;
  /** Ground speed in m/s; `null` when unknown. */
  speed: number | null;
  /** When the fix was taken, epoch ms. */
  at: number;
}>('SET_LOCATION');

export const toggleLocate = createAction<boolean | undefined>('LOCATE');

export const locationSetHeadingSource = createAction<HeadingSource>(
  'LOCATION_SET_HEADING_SOURCE',
);

export const locationSetShowBearingLine = createAction<boolean>(
  'LOCATION_SET_SHOW_BEARING_LINE',
);
