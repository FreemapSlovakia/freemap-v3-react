import { createReducer } from '@reduxjs/toolkit';
import { weatherRadarSetSettings } from './actions.js';

/**
 * Persisted radar preferences. A dedicated settings slice, so a choice survives
 * turning the layer off and on again — the transient slice is cleared then.
 *
 * There is only one now: the server offers a single palette, with no smoothing
 * or snow variants to choose between.
 */
export interface WeatherRadarSettingsState {
  /** Extends the timeline past "now" with the forecast frames. Premium. */
  showNowcast: boolean;
}

export const weatherRadarSettingsInitialState: WeatherRadarSettingsState = {
  showNowcast: true,
};

export const weatherRadarSettingsReducer = createReducer(
  weatherRadarSettingsInitialState,
  (builder) =>
    builder.addCase(weatherRadarSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
