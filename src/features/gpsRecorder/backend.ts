import type { RootState } from '@app/store/store.js';
import type { Dispatch } from 'redux';
import {
  browserRecorderStatus,
  browserRecorderTrackSince,
  clearBrowserRecording,
  isBrowserRecording,
  setBrowserRecorderListeners,
  startBrowserRecording,
  stopBrowserRecording,
} from './browser/engine.js';
import {
  gpsRecorderAddPoints,
  gpsRecorderSetConnection,
  gpsRecorderSetError,
  gpsRecorderSetStatus,
} from './model/actions.js';
import { recorderConfigOf } from './model/settingsReducer.js';
import {
  missingPermissions,
  RECORDER_INTENT_URL,
  RecorderError,
  type RecorderPoint,
  type RecorderStatus,
} from './protocol.js';
import {
  assertSupportedVersion,
  clearTrack,
  getStatus,
  getTrackSince,
  startRecording,
  stopRecording,
  waitForRecording,
  waitForStatus,
} from './recorderClient.js';
import {
  closeRecorderStream,
  isRecorderStreamUsable,
  openRecorderStream,
  recorderStreamGeneration,
  reportRecorderStreamState,
} from './stream.js';
import { gpsRecorderPlatformSupported } from './support.js';

/**
 * Which engine records the track.
 *
 * - `app` — the standalone Android recorder over its loopback API. It owns the
 *   track, records in the background with a foreground service, and is the only
 *   one that survives a locked screen.
 * - `browser` — this page's own Geolocation API. Records only while the tab is
 *   alive and visible, and holds the only copy of the ride itself.
 */
export type RecorderBackendKind = 'app' | 'browser';

/**
 * What the feature needs of whatever is recording, and the whole of it. Both
 * implementations answer in the recorder's own vocabulary — a
 * {@link RecorderStatus} and {@link RecorderPoint}s under a monotonic `seq` — so
 * the handlers, the reducer and everything downstream never learn which one is
 * running.
 */
export interface RecorderBackend {
  readonly kind: RecorderBackendKind;

  getStatus(): Promise<RecorderStatus>;

  getTrackSince(since: number): Promise<{
    points: RecorderPoint[];
    fields: readonly string[];
  }>;

  /**
   * Begins recording, resolving whatever stands in the way first. Must be
   * reached from a real user gesture: the app backend may raise the Local
   * Network Access prompt or navigate to its launch intent, and the browser
   * backend may raise the location permission prompt.
   */
  start(): Promise<void>;

  /** Suspends recording, keeping the track. */
  stop(): Promise<void>;

  /** Discards the whole track. Refused while recording. */
  clear(): Promise<void>;

  /** Starts delivering fixes as they arrive. Idempotent. */
  attachStream(
    dispatch: Dispatch,
    fields: readonly string[],
    since: number,
  ): void;

  closeStream(): void;

  /**
   * A token that changes whenever the live view is torn down, so a sync that was
   * in flight while the tool was closed does not resurrect it.
   */
  streamGeneration(): number;

  /** Whether the live view can be believed. */
  isStreamUsable(): boolean;

  /** Puts the connection state back to whatever the live view is actually doing. */
  reportStreamState(dispatch: Dispatch): void;
}

function assertReady(status: RecorderStatus): void {
  assertSupportedVersion(status);

  // `canRecord` is the recorder's own verdict and the only blocking gate.
  // `setupComplete` covers recommended-but-optional steps (a vendor battery
  // policy, say), which belong in a warning rather than a refusal to start.
  if (!status.canRecord) {
    const missing = missingPermissions(status);

    throw new RecorderError(
      'setup-needed',
      missing.length > 0
        ? `missing permissions: ${missing.join(', ')}`
        : 'the recorder reports it cannot record',
    );
  }
}

function appBackend(state: RootState): RecorderBackend {
  const config = recorderConfigOf(state.gpsRecorderSettings);

  return {
    kind: 'app',

    getStatus,

    getTrackSince,

    async start() {
      let status: RecorderStatus;

      try {
        // First call of the flow, and it runs on the user's tap: this is what
        // brings up the Local Network Access prompt at an understandable moment.
        status = await getStatus();
      } catch (err) {
        if (!(err instanceof RecorderError) || err.failure !== 'unreachable') {
          throw err;
        }

        // Nothing answered. An installed recorder handles the intent and hands
        // focus back; a missing one lands the user on the download page.
        window.location.href = RECORDER_INTENT_URL;

        status = await waitForStatus();
      }

      assertReady(status);

      try {
        await startRecording(config);
      } catch (err) {
        if (
          !(err instanceof RecorderError) ||
          err.failure !== 'needs-foreground'
        ) {
          throw err;
        }

        // Android refused the recorder's foreground-service start because the
        // recorder is in the background — which it is whenever the page is what
        // the user is looking at, and which only a battery-optimisation
        // exemption lifts. So hand the job to the recorder's own activity, where
        // the same call is allowed. The config asked for above is already saved
        // on its side, so the recording it starts is the one that was requested.
        window.location.href = RECORDER_INTENT_URL;

        await waitForRecording();
      }
    },

    stop: stopRecording,

    clear: clearTrack,

    attachStream: openRecorderStream,

    closeStream: closeRecorderStream,

    streamGeneration: recorderStreamGeneration,

    isStreamUsable: isRecorderStreamUsable,

    reportStreamState: reportRecorderStreamState,
  };
}

function browserBackend(state: RootState): RecorderBackend {
  const config = recorderConfigOf(state.gpsRecorderSettings);

  // Whatever is recording is in this page, so there is no connection to make and
  // nothing that can go stale: the live view is up exactly while a recording is
  // running.
  const connection = () => (isBrowserRecording() ? 'live' : 'idle');

  return {
    kind: 'browser',

    getStatus: () => browserRecorderStatus(config),

    getTrackSince: (since) => browserRecorderTrackSince(since, config),

    start: () => startBrowserRecording(config),

    stop: stopBrowserRecording,

    clear: clearBrowserRecording,

    attachStream(dispatch) {
      setBrowserRecorderListeners({
        onPoints(points) {
          dispatch(gpsRecorderAddPoints(points));
        },

        // The engine has already stopped the recording by the time this runs, so
        // the status read here is the settled one. Dispatched raw rather than
        // through a sync, which would immediately clear the error it just set —
        // and safe as a raw dispatch for the same reason `clearHandler`'s is:
        // nothing about the track changed, only whether it is still growing.
        onFailure(failure) {
          void browserRecorderStatus(config).then((status) => {
            dispatch(gpsRecorderSetStatus(status));

            dispatch(
              gpsRecorderSetError({
                failure: failure.failure,
                detail: failure.message,
              }),
            );

            dispatch(gpsRecorderSetConnection(connection()));
          });
        },
      });

      dispatch(gpsRecorderSetConnection(connection()));
    },

    closeStream() {
      setBrowserRecorderListeners(null);
    },

    // A constant, because there is no socket for a late sync to resurrect and
    // attaching is idempotent — the guard the app backend needs has nothing to
    // guard here.
    streamGeneration: () => 0,

    isStreamUsable: () => true,

    reportStreamState(dispatch) {
      dispatch(gpsRecorderSetConnection(connection()));
    },
  };
}

/**
 * Which backend the settings ask for.
 *
 * Off Android there is no recorder app to choose, and the setting is not merely
 * ignored but never shown: mentioning an APK that cannot be installed is worse
 * than saying nothing.
 */
export function recorderBackendKind(state: RootState): RecorderBackendKind {
  return gpsRecorderPlatformSupported
    ? state.gpsRecorderSettings.backend
    : 'browser';
}

export function recorderBackend(state: RootState): RecorderBackend {
  return recorderBackendKind(state) === 'app'
    ? appBackend(state)
    : browserBackend(state);
}
