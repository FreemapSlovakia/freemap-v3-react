import { createReducer } from '@reduxjs/toolkit';
import type { ColorScheme, RadarFrame } from '../api.js';
import {
  weatherRadarClear,
  weatherRadarSetFrames,
  weatherRadarSetPlaying,
  weatherRadarSetTime,
} from './actions.js';

/**
 * The live state of the radar animation. Transient: it is what the server last
 * reported plus where the user is in it, and it is dropped when the layer goes.
 * The preferences that outlive a session live in `weatherRadarSettings`.
 */
export interface WeatherRadarState {
  frames: RadarFrame[];
  /** Colour schemes the server offers, named by it. */
  colorSchemes: ColorScheme[];
  /** When the server built the frame list; `null` before the first answer. */
  generated: number | null;
  /**
   * The frame the map shows, by its time. `null` follows the newest observed
   * frame, so a refresh moves the view forward on its own — which is what the
   * user who has not scrubbed anywhere expects to see.
   */
  selectedTime: number | null;
  playing: boolean;
}

export const weatherRadarInitialState: WeatherRadarState = {
  frames: [],
  colorSchemes: [],
  generated: null,
  selectedTime: null,
  playing: false,
};

export const weatherRadarReducer = createReducer(
  weatherRadarInitialState,
  (builder) =>
    builder
      .addCase(
        weatherRadarSetFrames,
        (state, { payload: { frames, colorSchemes, generated } }) => {
          state.frames = frames;

          state.colorSchemes = colorSchemes;

          state.generated = generated;

          // A frame the server has dropped can't be shown any more, so fall
          // back to following the newest one instead of showing nothing.
          if (
            state.selectedTime !== null &&
            !frames.some((frame) => frame.time === state.selectedTime)
          ) {
            state.selectedTime = null;
          }
        },
      )
      .addCase(weatherRadarSetTime, (state, { payload }) => {
        state.selectedTime = payload;
      })
      .addCase(weatherRadarSetPlaying, (state, { payload }) => {
        state.playing = payload;
      })
      .addCase(weatherRadarClear, () => weatherRadarInitialState),
);
