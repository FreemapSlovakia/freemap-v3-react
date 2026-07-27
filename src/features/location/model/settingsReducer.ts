import { createReducer } from '@reduxjs/toolkit';
import z from 'zod';
import { isCompassPermissionRequired, isCompassSupported } from '../compass.js';
import {
  locationSetHeadingSource,
  locationSetShowBearingLine,
} from './actions.js';

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
  /**
   * Draw the crosshair in the middle of the map, the line from it to the
   * located position, and the distance/bearing readout on that line.
   */
  showBearingLine: boolean;
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
  // On by default because it costs nothing until it says something: the whole
  // display appears only once the map is panned away from the position, and the
  // moment it is, "how far away am I, and which way" is the question being
  // asked.
  showBearingLine: true,
};

export const locationSettingsReducer = createReducer(
  locationSettingsInitialState,
  (builder) =>
    builder
      .addCase(locationSetHeadingSource, (state, action) => {
        state.headingSource = action.payload;
      })
      .addCase(locationSetShowBearingLine, (state, action) => {
        state.showBearingLine = action.payload;
      }),
);
