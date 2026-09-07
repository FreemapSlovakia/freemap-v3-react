import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
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

/** Whoever wants a single fix to place something by; the wait lives in the store. */
export type FixConsumer = 'panorama' | 'toposcope-center' | 'viewshed';

/**
 * Asks for one fix good enough to place something by, borrowing the map's own
 * Locate me. Answered by {@link fixReady}, at once or off the first fix worth
 * having; see `locateOnceProcessor`.
 */
export const requestFix = createAction<FixConsumer>('REQUEST_FIX');

/**
 * Who is waiting. Dispatched by `locateOnceProcessor` **after** it turns
 * locating on, never by a button: any `toggleLocate` clears the wait, so
 * setting it first would clear it again on the way in. `null` gives up.
 */
export const setFixRequest = createAction<FixConsumer | null>(
  'SET_FIX_REQUEST',
);

/** The fix that was asked for, handed to whoever asked. */
export const fixReady = createAction<{ consumer: FixConsumer } & LatLon>(
  'FIX_READY',
);

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
