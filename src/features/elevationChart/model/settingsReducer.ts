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
   * Whether to read the high-resolution terrain model. Premium-only; switching
   * it off sends the read anonymously, which SRTM answers everywhere — trading
   * detail for a model with no culvert ditches at all.
   */
  highResolution: boolean;
}

export const elevationSettingsInitialState: ElevationSettingsState = {
  despikeWindow: 25,
  ditchFillWindow: 25,
  highResolution: true,
};

export const elevationSettingsReducer = createReducer(
  elevationSettingsInitialState,
  (builder) =>
    builder.addCase(elevationSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
