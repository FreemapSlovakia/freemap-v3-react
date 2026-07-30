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
 * A failure by cause, so the toast can say what to do about it. `detail` is the
 * untranslated technical text, kept for the devtools rather than shown: on a
 * loopback API it is often the only clue there is, and it is no use to the user.
 */
export interface GpsRecorderFailure {
  failure: RecorderFailure | 'unknown';
  detail: string;
}

/**
 * User asked to record. Must come from a real gesture: this is what triggers the
 * Local Network Access prompt and, if needed, the launch intent.
 */
export const gpsRecorderStart = createAction('GPS_RECORDER_START');

/**
 * Suspends the recording. This is the recorder's own `POST /stop` — it keeps the
 * track, and the next start continues it in a new segment — so from the user's
 * side it is a pause, and {@link gpsRecorderStop} is what actually ends a ride.
 */
export const gpsRecorderPause = createAction('GPS_RECORDER_PAUSE');

/**
 * Ends the recording and takes the track: suspend, hand the ride to the track
 * viewer, keep a copy in this browser, and only then let the recorder discard
 * its own — so the ride does not end up on the phone and in the app at once.
 */
export const gpsRecorderStop = createAction<'replace' | 'append'>(
  'GPS_RECORDER_STOP',
);

/**
 * Catch up over `/track?since=` and (re)attach the stream. Dispatched when the
 * tool opens, whenever the page returns to the foreground, and when a stream the
 * browser gave up on is revived — none of which needs a user gesture once Local
 * Network Access has been granted.
 *
 * `quiet` is for the syncs nobody asked for: following a recording at boot or on
 * returning to the page. A recorder that has since been killed or uninstalled
 * should not greet the user with an error they did nothing to provoke, so the
 * failure is swallowed and the following stops instead.
 */
export const gpsRecorderSync = createAction<{ quiet?: boolean } | undefined>(
  'GPS_RECORDER_SYNC',
);

/**
 * The stream pushed a status of its own accord — on connect, and thereafter
 * whenever the recorder's state genuinely changed. Reconciled exactly like a
 * polled one, so a clear, a stop or a permission withdrawn arrives when it
 * happens instead of on the next poll.
 */
export const gpsRecorderPushedStatus = createAction<RecorderStatus>(
  'GPS_RECORDER_PUSHED_STATUS',
);

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

export const gpsRecorderSetStatus = createAction<RecorderStatus | null>(
  'GPS_RECORDER_SET_STATUS',
);

export const gpsRecorderAddPoints = createAction<RecorderPoint[]>(
  'GPS_RECORDER_ADD_POINTS',
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
