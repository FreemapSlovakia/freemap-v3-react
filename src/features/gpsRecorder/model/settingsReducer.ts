import { createReducer } from '@reduxjs/toolkit';
import type { RecorderBackendKind } from '../backend.js';
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
   * Which engine records the track. Meaningful only on Android, where both
   * exist; everywhere else `recorderBackendKind` reads `browser` regardless,
   * and the choice is never put to the user.
   */
  backend: RecorderBackendKind;
  /**
   * A silence longer than this starts a new segment. Seconds; `0` never splits.
   * A display/export preference, not something the recorder is told.
   */
  splitGapS: number;
  /**
   * What answers "Locate me" while recording: the recorded fixes, or the
   * browser's own GPS watch. Off means the browser is always the source, which
   * follows a sparse recording more smoothly but watches the GPS a second time
   * alongside the recorder.
   */
  feedLocation: boolean;
  /** Holds a screen wake lock while recording, so a long ride stays visible. */
  keepScreenAwake: boolean;
}

export const gpsRecorderSettingsInitialState: GpsRecorderSettingsState = {
  // The recorder app where it exists: it records with the screen off, chooses
  // its provider, and measures an altitude worth keeping. The browser is the
  // fallback, offered when the app turns out not to be installed.
  backend: 'app',
  intervalMs: 1000,
  minDistanceM: 0,
  maxAccuracyM: null,
  priority: 'high',
  // The receiver rather than the fusion, because a recording is kept for its
  // profile as much as its line, and the fused altitude repeats itself for
  // seconds at a time. The recorder's own default is the other way round.
  source: 'gps',
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
  source,
}: GpsRecorderSettingsState): RecorderConfig {
  return { intervalMs, minDistanceM, maxAccuracyM, priority, source };
}
