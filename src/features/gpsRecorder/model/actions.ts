import { createAction } from '@reduxjs/toolkit';
import type {
  RecorderFailure,
  RecorderPoint,
  RecorderStatus,
} from '../protocol.js';
import type { GpsRecorderSettingsState } from './settingsReducer.js';

/**
 * Whether the live view is attached. Independent of whether the recorder is
 * recording — it owns the track either way, and losing the stream costs only
 * the live update.
 */
export type GpsRecorderConnection =
  | 'idle'
  | 'connecting'
  /** Catching up over `/track?since=`; distinct from still trying to be heard. */
  | 'syncing'
  | 'live'
  | 'reconnecting';

/**
 * A failure by cause, so the panel can say what to do about it. `detail` is the
 * untranslated technical text, shown alongside the localized explanation
 * because on a loopback API it is often the only clue there is.
 */
export interface GpsRecorderFailure {
  failure: RecorderFailure | 'unknown';
  detail: string;
}

/**
 * User asked to record, or to resume a paused session. Must come from a real
 * gesture: this is what triggers the Local Network Access prompt and, if
 * needed, the launch intent.
 */
export const gpsRecorderStart = createAction('GPS_RECORDER_START');

/** Suspends the session; resuming it opens a new segment. */
export const gpsRecorderPause = createAction('GPS_RECORDER_PAUSE');

export const gpsRecorderStop = createAction('GPS_RECORDER_STOP');

/**
 * Catch up over `/track?since=` and (re)attach the stream. Dispatched when the
 * tool opens, on a slow timer, and whenever the page returns to the foreground
 * — none of which needs a user gesture once Local Network Access has been
 * granted.
 */
export const gpsRecorderSync = createAction('GPS_RECORDER_SYNC');

/** Detaches the live view, without touching the recording or the track. */
export const gpsRecorderDisconnect = createAction('GPS_RECORDER_DISCONNECT');

/**
 * Asks the recorder to discard its whole track — the one action that destroys
 * data it owns, so the UI confirms first.
 */
export const gpsRecorderClear = createAction('GPS_RECORDER_CLEAR');

/** The recorder confirmed the track is gone; drop the local copy with it. */
export const gpsRecorderTrackCleared = createAction(
  'GPS_RECORDER_TRACK_CLEARED',
);

/** Hands the recording to the track viewer, beside or in place of its track. */
export const gpsRecorderSave = createAction<'replace' | 'append'>(
  'GPS_RECORDER_SAVE',
);

export const gpsRecorderSetStatus = createAction<RecorderStatus | null>(
  'GPS_RECORDER_SET_STATUS',
);

export const gpsRecorderAddPoints = createAction<RecorderPoint[]>(
  'GPS_RECORDER_ADD_POINTS',
);

/**
 * Marks the seq of the last point before a break this app caused, so a pause
 * too short for the time rule to notice still splits the track. Recorded at the
 * pause/stop rather than at the resume, because that is when the recorder can
 * still say what its last point was.
 */
export const gpsRecorderAddBreak = createAction<number>(
  'GPS_RECORDER_ADD_BREAK',
);

/** Whether a stopped recorder is holding a session open rather than finished. */
export const gpsRecorderSetPaused = createAction<boolean>(
  'GPS_RECORDER_SET_PAUSED',
);

/**
 * Whether a transport command the user gave is still in flight. Separate from
 * the connection state, which the background poll moves through `connecting`
 * every few seconds — blocking the transport on that would grey out the Record
 * button at the very moments the recorder is unreachable and the user is trying
 * to press it.
 */
export const gpsRecorderSetPending = createAction<boolean>(
  'GPS_RECORDER_SET_PENDING',
);

export const gpsRecorderSetConnection = createAction<GpsRecorderConnection>(
  'GPS_RECORDER_SET_CONNECTION',
);

export const gpsRecorderSetSettings = createAction<
  Partial<GpsRecorderSettingsState>
>('GPS_RECORDER_SET_SETTINGS');

export const gpsRecorderSetError = createAction<GpsRecorderFailure | null>(
  'GPS_RECORDER_SET_ERROR',
);
