import { createAction } from '@reduxjs/toolkit';
import type { RecorderPoint, RecorderStatus } from '../protocol.js';

/**
 * Whether the live view is attached. Independent of whether the recorder is
 * recording — it owns the track either way, and losing the stream costs only
 * the live update.
 */
export type GpsRecorderConnection =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting';

/**
 * User asked to record. Must come from a real gesture: this is what triggers
 * the Local Network Access prompt and, if needed, the launch intent.
 */
export const gpsRecorderStart = createAction('GPS_RECORDER_START');

export const gpsRecorderStop = createAction('GPS_RECORDER_STOP');

/** Catch up over `/track?since=` and (re)attach the stream. */
export const gpsRecorderSync = createAction('GPS_RECORDER_SYNC');

/**
 * Asks the recorder to discard its whole track — the one action that destroys
 * data it owns, so the UI confirms first.
 */
export const gpsRecorderClear = createAction('GPS_RECORDER_CLEAR');

/** The recorder confirmed the track is gone; drop the local copy with it. */
export const gpsRecorderTrackCleared = createAction(
  'GPS_RECORDER_TRACK_CLEARED',
);

export const gpsRecorderSetStatus = createAction<RecorderStatus | null>(
  'GPS_RECORDER_SET_STATUS',
);

export const gpsRecorderAddPoints = createAction<RecorderPoint[]>(
  'GPS_RECORDER_ADD_POINTS',
);

export const gpsRecorderSetConnection = createAction<GpsRecorderConnection>(
  'GPS_RECORDER_SET_CONNECTION',
);

/** Raw failure text; stage 1 shows it verbatim. */
export const gpsRecorderSetError = createAction<string | null>(
  'GPS_RECORDER_SET_ERROR',
);
