import { createReducer } from '@reduxjs/toolkit';
import z from 'zod';
import { isCompassPermissionRequired, isCompassSupported } from '../compass.js';
import { locationSetHeadingSource } from './actions.js';

/**
 * Where the heading beam on the located position comes from:
 *
 * - `none` — no beam at all.
 * - `gps` — course over ground, which the fix carries for free but only while
 *   the user actually moves.
 * - `compass` — the device magnetometer, which also works standing still, but
 *   needs a permission grant on iOS and varies wildly in quality. Falls back to
 *   the course when the compass is missing or contradicts it.
 */
export const HeadingSourceSchema = z.enum(['none', 'gps', 'compass']);

export type HeadingSource = z.infer<typeof HeadingSourceSchema>;

/**
 * Persisted locating preferences. Separate from the transient `location` slice,
 * which `toggleLocate` resets on every toggle.
 */
export interface LocationSettingsState {
  headingSource: HeadingSource;
}

/**
 * The compass is only worth withholding where turning it on costs the user a
 * permission dialog — on iOS, where an unexplained prompt at an arbitrary
 * moment mostly earns a refusal. Everywhere else it is strictly better than the
 * course over ground (it works standing still, and updates far more smoothly),
 * so it is the default and the magnetometer costs nothing next to the GPS that
 * is already running whenever the beam is drawn.
 */
export const locationSettingsInitialState: LocationSettingsState = {
  headingSource:
    isCompassSupported() && !isCompassPermissionRequired() ? 'compass' : 'gps',
};

export const locationSettingsReducer = createReducer(
  locationSettingsInitialState,
  (builder) =>
    builder.addCase(locationSetHeadingSource, (state, action) => {
      state.headingSource = action.payload;
    }),
);
