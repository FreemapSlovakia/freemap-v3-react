import { createReducer } from '@reduxjs/toolkit';
import { weatherRadarSetSettings } from './actions.js';

/**
 * Persisted radar preferences. A dedicated settings slice, so a choice survives
 * turning the layer off and on again — the transient slice is cleared then.
 */
export interface WeatherRadarSettingsState {
  /** Id of a colour scheme the server offers; see `weatherRadar.colorSchemes`. */
  colorScheme: number;
  /** Interpolates between reflectivity steps instead of drawing them as bands. */
  smooth: boolean;
  /** Draws frozen precipitation in its own palette. */
  snow: boolean;
  /** Extends the timeline past "now" with the model nowcast frames. */
  showNowcast: boolean;
}

export const weatherRadarSettingsInitialState: WeatherRadarSettingsState = {
  // "Universal Blue" — the one scheme that reads as weather over a map rather
  // than competing with it, and the closest to what other European radars show.
  colorScheme: 2,
  smooth: true,
  snow: true,
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
