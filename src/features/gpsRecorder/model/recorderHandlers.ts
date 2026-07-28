import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { Dispatch } from 'redux';
import {
  RECORDER_DOWNLOAD_URL,
  RECORDER_INTENT_URL,
  RecorderError,
  type RecorderStatus,
} from '../protocol.js';
import {
  assertSupportedVersion,
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

  if (status.missingPermissions.length > 0) {
    throw new RecorderError(
      'setup-needed',
      `missing permissions: ${status.missingPermissions.join(', ')}`,
    );
  }
}

/** Catches up over `/track?since=` and leaves the live stream attached. */
export const syncHandler: ProcessorHandler = async ({ dispatch, getState }) => {
  const { points, cursor } = getState().gpsRecorder;

  // A cold start holds no points, so the whole track is refetched: the recorder
  // owns it, and the cursor only describes what this page already has.
  const since = points.length === 0 ? 0 : cursor;

  try {
    dispatch(gpsRecorderAddPoints(await getTrackSince(since)));

    dispatch(gpsRecorderSetStatus(await getStatus()));
  } catch (err) {
    // A failed catch-up says nothing about an already-working stream, so it is
    // only reported — the browser keeps the stream and its retries alive.
    reportFailure(dispatch, err);

    return;
  }

  dispatch(gpsRecorderSetError(null));

  if (!isRecorderStreamOpen()) {
    dispatch(gpsRecorderSetConnection('connecting'));

    openRecorderStream(dispatch);
  }
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
