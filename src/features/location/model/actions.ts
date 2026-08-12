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

/**
 * No fix could be obtained. Locating itself stays on, so one arriving later is
 * still taken; this only ends the wait for the first one.
 */
export const locateFailed = createAction('LOCATE_FAILED');

/**
 * Whether something other than the browser is supplying fixes — the GPS
 * recorder, while it is recording and set to feed them here.
 *
 * Only one source may run at a time: the browser's own `watchPosition` asks for
 * continuous high accuracy, which Android merges with the recorder's request at
 * the higher rate, quietly cancelling whatever the recording was configured to
 * save. So while this holds, `locateProcessor` leaves the watch alone and the
 * external source dispatches {@link setLocation} itself.
 */
export const locationSetExternalSource = createAction<boolean>(
  'LOCATION_SET_EXTERNAL_SOURCE',
);

export const locationSetHeadingSource = createAction<HeadingSource>(
  'LOCATION_SET_HEADING_SOURCE',
);

export const locationSetShowBearingLine = createAction<boolean>(
  'LOCATION_SET_SHOW_BEARING_LINE',
);
