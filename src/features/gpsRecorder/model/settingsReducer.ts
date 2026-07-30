import { createReducer } from '@reduxjs/toolkit';
import type { RecorderConfig } from '../protocol.js';
import { gpsRecorderSetSettings } from './actions.js';

/**
 * Persisted recorder preferences. A dedicated settings slice, so nothing here
 * is lost to a map clear or a track delete the way a preference kept in the
 * transient slice would be.
 *
 * Split in two by who acts on it: the `RecorderConfig` half travels to the
 * recorder with `POST /start` and decides what gets recorded at all, while the
 * rest never leaves the browser and only decides how the recording is shown.
 */
export interface GpsRecorderSettingsState extends RecorderConfig {
  /**
   * A silence longer than this starts a new segment. Seconds; `0` never splits.
   * A display/export preference, not something the recorder is told.
   */
  splitGapS: number;
  /**
   * Feeds the recorder's fixes to the map's own position marker while
   * recording, instead of the browser watching the GPS a second time. Off means
   * the browser is always the source, which tracks a sparse recording more
   * smoothly at the cost of running its own high-accuracy watch alongside.
   */
  feedLocation: boolean;
  /** Holds a screen wake lock while recording, so a long ride stays visible. */
  keepScreenAwake: boolean;
}

export const gpsRecorderSettingsInitialState: GpsRecorderSettingsState = {
  intervalMs: 1000,
  minDistanceM: 0,
  maxAccuracyM: null,
  priority: 'high',
  splitGapS: 300,
  feedLocation: true,
  keepScreenAwake: false,
};

export const gpsRecorderSettingsReducer = createReducer(
  gpsRecorderSettingsInitialState,
  (builder) =>
    builder.addCase(gpsRecorderSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);

/** The half of the settings the recorder is asked to apply. */
export function recorderConfigOf({
  intervalMs,
  minDistanceM,
  maxAccuracyM,
  priority,
}: GpsRecorderSettingsState): RecorderConfig {
  return { intervalMs, minDistanceM, maxAccuracyM, priority };
}
