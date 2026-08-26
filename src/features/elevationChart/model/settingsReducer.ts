import { createReducer } from '@reduxjs/toolkit';
import { STEEPNESS_DEFAULT_SCALE } from '@shared/colorizers/modes/steepness.js';
import { elevationSetSettings } from './actions.js';

// Preferences governing every elevation read and the profiles derived from it,
// so they live in one slice rather than per consumer (route planner, track
// viewer, export). A dedicated settings slice, so they survive map clears.
export interface ElevationSettingsState {
  /**
   * Width in metres of the running median that drops spikes — where a way is
   * digitised a few metres off the road it describes, the terrain model answers
   * with the bank or rock face beside it. Excursions wider than half of this
   * survive, so genuine terrain does. A half-width average follows, rounding
   * off the steps a median leaves. `0` turns both off.
   */
  despikeWindow: number;
  /**
   * Width in metres of the morphological closing that fills the narrow ditches
   * a hydrologically conditioned terrain model digs for culverts. Dips wider
   * than this are left alone, so genuine terrain survives. `0` turns it off.
   */
  ditchFillWindow: number;
  /**
   * Length in metres of the stretch the steepness readout is averaged over —
   * see `gradeAt`. Unlike the two above this corrects nothing, it only widens
   * what a single readout describes. `0` measures between neighbouring profile
   * points, which on a recorded track is mostly GPS noise;
   * `GRADE_WINDOW_WHOLE_LINE` measures across the whole line at once.
   */
  gradeWindow: number;
  /**
   * The grade the steepness colorize palette ends at, as a ratio — see
   * `STEEPNESS_SCALES`. Like `gradeWindow` it corrects nothing, it only says
   * what a reading is shown against, and it belongs to the reader rather than
   * to a map feature, so all three colorize consumers share this one.
   */
  steepnessScale: number;
}

/**
 * The `gradeWindow` that stretches to whatever the line is long, so the readout
 * reports the rise between its two ends over its whole length — on a straight
 * measuring line, the angle one end stands at as seen from the other, the run
 * being measured along the line either way. Out of band rather than a large
 * number of metres: the window is unbounded, and no metre value is right for
 * every line. Turn it into the window `gradeAt` takes with `gradeWindowMeters`.
 */
export const GRADE_WINDOW_WHOLE_LINE = -1;

/** The length `gradeAt` measures over for a stored `gradeWindow`. */
export function gradeWindowMeters(gradeWindow: number): number {
  return gradeWindow === GRADE_WINDOW_WHOLE_LINE
    ? Number.POSITIVE_INFINITY
    : gradeWindow;
}

/**
 * Whether an `elevationSetSettings` payload alters the smoothing every derived
 * elevation cache and profile is built from — the one reason to drop those
 * caches and resample. The other fields are read off the drawn points by
 * whoever displays them, so a change to those alone rebuilds nothing. Every
 * consumer of the action asks this rather than reacting to the bare action.
 */
export function affectsElevationSmoothing(
  payload: Partial<ElevationSettingsState>,
): boolean {
  return 'despikeWindow' in payload || 'ditchFillWindow' in payload;
}

export const elevationSettingsInitialState: ElevationSettingsState = {
  despikeWindow: 25,
  ditchFillWindow: 25,
  gradeWindow: 50,
  steepnessScale: STEEPNESS_DEFAULT_SCALE,
};

export const elevationSettingsReducer = createReducer(
  elevationSettingsInitialState,
  (builder) =>
    builder.addCase(elevationSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
