import { createReducer } from '@reduxjs/toolkit';
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
   * points, which on a recorded track is mostly GPS noise.
   */
  gradeWindow: number;
}

/**
 * Whether an `elevationSetSettings` payload alters the smoothing every derived
 * elevation cache and profile is built from — the one reason to drop those
 * caches and resample. `gradeWindow` is measured off the drawn points by
 * whoever shows the readout, so a change to it alone rebuilds nothing. Every
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
};

export const elevationSettingsReducer = createReducer(
  elevationSettingsInitialState,
  (builder) =>
    builder.addCase(elevationSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
