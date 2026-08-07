import { createReducer } from '@reduxjs/toolkit';
import type { FeedInfo, RadarFeed, RadarFrame } from '../api.js';
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
  /**
   * Per feed: the tile format it is currently serving and the zoom band it
   * covers. Read from the status documents rather than assumed, so the server
   * can move from PNG to WebP — or widen a zoom range — without an app deploy.
   */
  feeds: Partial<Record<RadarFeed, FeedInfo>>;
  /**
   * The frame the map shows, by its time. `null` follows the newest measured
   * frame, so a refresh moves the view forward on its own — which is what the
   * user who has not scrubbed anywhere expects to see.
   */
  selectedTime: number | null;
  playing: boolean;
}

export const weatherRadarInitialState: WeatherRadarState = {
  frames: [],
  feeds: {},
  selectedTime: null,
  playing: false,
};

/**
 * What to store as the selection for a wanted time.
 *
 * `null` means "live": follow the newest measured frame, so a refresh carries
 * the view forward. Any other frame is pinned to its absolute time and stays
 * put as the window advances — but a pinned frame does not last forever. The
 * oldest ages off the end every ten minutes, and forecast frames are
 * republished on shifted timestamps, so a selection can simply cease to exist.
 * It then moves to the nearest frame that does, which keeps a viewer of the old
 * end at the old end instead of flinging them hours forward to live.
 */
function pinnedTime(
  frames: RadarFrame[],
  wanted: number | null,
): number | null {
  if (wanted === null || frames.length === 0) {
    return null;
  }

  const target = frames.some((frame) => frame.time === wanted)
    ? wanted
    : frames.reduce((best, frame) =>
        Math.abs(frame.time - wanted) < Math.abs(best.time - wanted)
          ? frame
          : best,
      ).time;

  const newestMeasured = frames.findLast((frame) => !frame.forecast)?.time;

  return target === newestMeasured ? null : target;
}

export const weatherRadarReducer = createReducer(
  weatherRadarInitialState,
  (builder) =>
    builder
      .addCase(
        weatherRadarSetFrames,
        (state, { payload: { frames, feeds } }) => {
          state.frames = frames;

          state.feeds = feeds;

          state.selectedTime = pinnedTime(frames, state.selectedTime);
        },
      )
      .addCase(weatherRadarSetTime, (state, { payload }) => {
        state.selectedTime = pinnedTime(state.frames, payload);
      })
      .addCase(weatherRadarSetPlaying, (state, { payload }) => {
        state.playing = payload;
      })
      .addCase(weatherRadarClear, () => weatherRadarInitialState),
);
