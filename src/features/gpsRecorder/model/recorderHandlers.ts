import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { Dispatch } from 'redux';
import {
  missingPermissions,
  RECORDER_DOWNLOAD_URL,
  RECORDER_INTENT_URL,
  RecorderError,
  type RecorderStatus,
} from '../protocol.js';
import {
  assertSupportedVersion,
  clearTrack,
  getStatus,
  getTrackSince,
  startRecording,
  stopRecording,
  waitForStatus,
} from '../recorderClient.js';
import {
  closeRecorderStream,
  isRecorderStreamOpen,
  openRecorderStream,
} from '../stream.js';
import {
  gpsRecorderAddPoints,
  gpsRecorderSetConnection,
  gpsRecorderSetError,
  gpsRecorderSetStatus,
  gpsRecorderTrackCleared,
} from './actions.js';

/**
 * Stage-1 error text: raw, English, but named by cause so the three failures
 * the user can act on stay distinguishable. Stage 2 replaces this with proper
 * localized states.
 */
function describeFailure(err: unknown): string {
  if (!(err instanceof RecorderError)) {
    return String(err);
  }

  switch (err.failure) {
    case 'lna-denied':
      return `Local network access denied, so the live view is unavailable. Recording itself is unaffected. (${err.message})`;

    case 'setup-needed':
      return `The recorder needs setup — open it and grant what it asks for. (${err.message})`;

    case 'recording':
      return 'Stop the recording before deleting its track.';

    case 'unreachable':
      return `The recorder did not respond. Install it from ${RECORDER_DOWNLOAD_URL}. (${err.message})`;

    case 'outdated':
      return `The recorder is too old for this version of the map. Update it from ${RECORDER_DOWNLOAD_URL}. (${err.message})`;

    default:
      return `${err.failure}: ${err.message}`;
  }
}

function reportFailure(dispatch: Dispatch, err: unknown): void {
  dispatch(gpsRecorderSetError(describeFailure(err)));
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

/** Catches up over `/track?since=` and leaves the live stream attached. */
export const syncHandler: ProcessorHandler = async ({ dispatch, getState }) => {
  // Read before the fresh status lands, so the generation below is the one this
  // page's points were fetched under.
  const { points, cursor, generation } = getState().gpsRecorder;

  let fields: string[];

  try {
    const status = await getStatus();

    // `seq` never restarts, so a cleared track is indistinguishable from one
    // that simply hasn't grown — a bumped `generation` is the only reliable
    // signal that what we hold is gone. Asking for everything after a stale
    // cursor would leave the deleted track on screen forever.
    const cleared = generation !== null && status.generation !== generation;

    if (cleared) {
      dispatch(gpsRecorderTrackCleared());
    }

    dispatch(gpsRecorderSetStatus(status));

    // A cold start holds no points, so the whole track is refetched: the
    // recorder owns it, and the cursor only says what this page already has.
    const page = await getTrackSince(
      cleared || points.length === 0 ? 0 : cursor,
    );

    fields = page.fields;

    dispatch(gpsRecorderAddPoints(page.points));
  } catch (err) {
    // A failed catch-up says nothing about an already-working stream, so it is
    // only reported — the browser keeps the stream and its retries alive.
    reportFailure(dispatch, err);

    return;
  }

  dispatch(gpsRecorderSetError(null));

  if (!isRecorderStreamOpen()) {
    dispatch(gpsRecorderSetConnection('connecting'));
  }

  openRecorderStream(dispatch, fields);
};

export const startHandler: ProcessorHandler = async (params) => {
  const { dispatch } = params;

  dispatch(gpsRecorderSetError(null));

  dispatch(gpsRecorderSetConnection('connecting'));

  const fail = (err: unknown) => {
    closeRecorderStream();

    dispatch(gpsRecorderSetConnection('idle'));

    reportFailure(dispatch, err);
  };

  let status: RecorderStatus;

  try {
    // First call of the flow, and it runs on the user's tap: this is what
    // brings up the Local Network Access prompt at an understandable moment.
    status = await getStatus();
  } catch (err) {
    if (!(err instanceof RecorderError) || err.failure !== 'unreachable') {
      fail(err);

      return;
    }

    // Nothing answered. An installed recorder handles the intent and hands
    // focus back; a missing one lands the user on the download page.
    window.location.href = RECORDER_INTENT_URL;

    try {
      status = await waitForStatus();
    } catch (err2) {
      fail(err2);

      return;
    }
  }

  try {
    assertReady(status);

    await startRecording();

    dispatch(gpsRecorderSetStatus(await getStatus()));
  } catch (err) {
    fail(err);

    return;
  }

  await syncHandler(params);
};

/**
 * Discards the recorder's track, then the local copy of it. Ordered that way on
 * purpose: if the delete fails, the screen still shows what the recorder holds
 * rather than pretending it is gone.
 */
export const clearHandler: ProcessorHandler = async ({ dispatch }) => {
  try {
    await clearTrack();
  } catch (err) {
    reportFailure(dispatch, err);

    return;
  }

  dispatch(gpsRecorderTrackCleared());

  dispatch(gpsRecorderSetError(null));

  try {
    dispatch(gpsRecorderSetStatus(await getStatus()));
  } catch (err) {
    reportFailure(dispatch, err);
  }
};

export const stopHandler: ProcessorHandler = async ({ dispatch }) => {
  closeRecorderStream();

  dispatch(gpsRecorderSetConnection('idle'));

  try {
    await stopRecording();

    dispatch(gpsRecorderSetStatus(await getStatus()));
  } catch (err) {
    reportFailure(dispatch, err);
  }
};
