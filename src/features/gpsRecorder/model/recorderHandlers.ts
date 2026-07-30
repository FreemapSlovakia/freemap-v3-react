import { setTool } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '@features/trackViewer/model/actions.js';
import type { FeatureCollection } from 'geojson';
import type { Dispatch } from 'redux';
import {
  missingPermissions,
  RECORDER_INTENT_URL,
  RecorderError,
  type RecorderStatus,
  truncateDetail,
} from '../protocol.js';
import {
  assertSupportedVersion,
  clearTrack,
  getStatus,
  getTrackSince,
  pauseRecording,
  resumeRecording,
  startRecording,
  stopRecording,
  waitForStatus,
} from '../recorderClient.js';
import {
  closeRecorderStream,
  isRecorderStreamOpen,
  openRecorderStream,
} from '../stream.js';
import { recorderSegmentsToFeatureCollection } from '../trackGeojson.js';
import {
  gpsRecorderAddBreak,
  gpsRecorderAddPoints,
  type gpsRecorderPushedStatus,
  gpsRecorderSetConnection,
  gpsRecorderSetError,
  gpsRecorderSetPaused,
  gpsRecorderSetPending,
  gpsRecorderSetStatus,
  gpsRecorderTrackCleared,
} from './actions.js';
import { selectRecorderSegments } from './selectors.js';
import { recorderConfigOf } from './settingsReducer.js';

function reportFailure(dispatch: Dispatch, err: unknown): void {
  dispatch(
    gpsRecorderSetError(
      err instanceof RecorderError
        ? { failure: err.failure, detail: err.message }
        : { failure: 'unknown', detail: truncateDetail(String(err)) },
    ),
  );
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

/**
 * Reconciles a status — however it arrived — with the track held here, fetching
 * whatever the recorder has that this page hasn't. Returns the point column
 * order it learned, for the stream to decode its bare rows with.
 */
async function applyStatus(
  dispatch: Dispatch,
  status: RecorderStatus,
  held: { points: number; cursor: number; generation: number | null },
): Promise<readonly string[] | undefined> {
  // Checked wherever a status lands, not only on the way into a recording: a
  // recorder too old for these endpoints is told so as soon as the tool is
  // opened, with the update link the failure carries.
  assertSupportedVersion(status);

  // `seq` never restarts, so a cleared track is indistinguishable from one that
  // simply hasn't grown — a bumped `generation` is the only reliable signal that
  // what we hold is gone. Asking for everything after a stale cursor would leave
  // the deleted track on screen forever.
  const cleared =
    held.generation !== null &&
    status.generation != null &&
    status.generation !== held.generation;

  if (cleared) {
    dispatch(gpsRecorderTrackCleared());
  }

  dispatch(gpsRecorderSetStatus(status));

  // A cold start holds no points, so the whole track is refetched: the recorder
  // owns it, and the cursor only says what this page already has.
  const fromZero = cleared || held.points === 0;

  // `lastSeq` above the cursor means fixes are missing here — the page was
  // frozen in the background, or the stream is not attached at all. Both are
  // single comparisons against a status that has to be read anyway.
  if (status.count > 0 && (fromZero || (status.lastSeq ?? 0) > held.cursor)) {
    dispatch(gpsRecorderSetConnection('syncing'));

    const page = await getTrackSince(fromZero ? 0 : held.cursor);

    dispatch(gpsRecorderAddPoints(page.points));

    return page.fields;
  }

  return status.fields ?? undefined;
}

/**
 * Catches up over `/track?since=` and leaves the live stream attached. Runs when
 * the tool opens, when the page returns to the foreground, after the stream has
 * been given up on, at the end of the start flow, and on the fallback timer for
 * a recorder that pushes no status of its own.
 */
export const syncHandler: ProcessorHandler = async ({ dispatch, getState }) => {
  // Read before the fresh status lands, so the generation below is the one this
  // page's points were fetched under.
  const { points, cursor, generation } = getState().gpsRecorder;

  const streaming = isRecorderStreamOpen();

  if (!streaming) {
    dispatch(gpsRecorderSetConnection('connecting'));
  }

  let fields: readonly string[] | undefined;

  try {
    fields = await applyStatus(dispatch, await getStatus(), {
      points: points.length,
      cursor,
      generation,
    });
  } catch (err) {
    // A failed catch-up says nothing about an already-working stream, so it is
    // only reported — the browser keeps the stream and its retries alive.
    reportFailure(dispatch, err);

    if (!streaming) {
      dispatch(gpsRecorderSetConnection('idle'));
    }

    return;
  }

  dispatch(gpsRecorderSetError(null));

  openRecorderStream(dispatch, fields);
};

/**
 * A status the stream pushed. Same reconciliation as a polled one — the point of
 * the push is that it arrives at the moment the recorder's state changed, not
 * that it means anything different.
 */
export const pushedStatusHandler: ProcessorHandler<
  typeof gpsRecorderPushedStatus
> = async ({ dispatch, getState, action }) => {
  const { points, cursor, generation } = getState().gpsRecorder;

  try {
    const fields = await applyStatus(dispatch, action.payload, {
      points: points.length,
      cursor,
      generation,
    });

    // Idempotent for an already-open stream; this only refreshes the column
    // order and restores the connection state the catch-up moved off `live`.
    openRecorderStream(dispatch, fields);
  } catch (err) {
    reportFailure(dispatch, err);
  }
};

/** Begins recording, or resumes a session this app paused. */
export const startHandler: ProcessorHandler = async (params) => {
  const { dispatch, getState } = params;

  const wasPaused = getState().gpsRecorder.paused;

  const config = recorderConfigOf(getState().gpsRecorderSettings);

  dispatch(gpsRecorderSetError(null));

  dispatch(gpsRecorderSetPending(true));

  dispatch(gpsRecorderSetConnection('connecting'));

  const fail = (err: unknown) => {
    closeRecorderStream();

    dispatch(gpsRecorderSetPending(false));

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

    if (wasPaused) {
      await resumeRecording(config);
    } else {
      await startRecording(config);
    }

    dispatch(gpsRecorderSetPaused(false));

    dispatch(gpsRecorderSetStatus(await getStatus()));
  } catch (err) {
    fail(err);

    return;
  }

  dispatch(gpsRecorderSetPending(false));

  await syncHandler(params);
};

/**
 * Ends the fix flow, marking where the track breaks so the next start opens a
 * new segment rather than drawing a line across the interruption.
 *
 * The break is taken from the recorder's own `lastSeq` rather than this page's
 * cursor: a fix recorded while the page was frozen has not arrived here yet,
 * and breaking after the cursor would then cut the track mid-segment.
 */
async function endRecording(
  dispatch: Dispatch,
  paused: boolean,
): Promise<void> {
  dispatch(gpsRecorderSetPending(true));

  try {
    if (paused) {
      await pauseRecording();
    } else {
      await stopRecording();
    }

    const status = await getStatus();

    dispatch(gpsRecorderSetStatus(status));

    dispatch(gpsRecorderAddBreak(status.lastSeq ?? 0));

    dispatch(gpsRecorderSetPaused(paused));
  } catch (err) {
    reportFailure(dispatch, err);
  } finally {
    dispatch(gpsRecorderSetPending(false));
  }
}

export const pauseHandler: ProcessorHandler = async ({ dispatch }) => {
  await endRecording(dispatch, true);
};

export const stopHandler: ProcessorHandler = async ({ dispatch }) => {
  await endRecording(dispatch, false);
};

/** Detaches the live view. The recorder keeps recording and keeps its track. */
export const disconnectHandler: ProcessorHandler = ({ dispatch }) => {
  closeRecorderStream();

  dispatch(gpsRecorderSetConnection('idle'));
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

/**
 * Hands the recording to the track viewer, where it becomes an ordinary loaded
 * track: elevation, colorize, the chart and every export target then work on it
 * without the recorder knowing anything about them.
 *
 * A copy, not a move — the recording may still be running, and the recorder
 * stays the owner of its data until the user deletes it explicitly.
 */
export const saveHandler: ProcessorHandler = ({
  dispatch,
  getState,
  action,
}) => {
  const state = getState();

  const saved = recorderSegmentsToFeatureCollection(
    selectRecorderSegments(state),
  );

  if (saved.features.length === 0) {
    return;
  }

  const existing = state.trackViewer.trackGeojson;

  const trackGeojson: FeatureCollection =
    action.payload === 'append' && existing
      ? {
          type: 'FeatureCollection',
          features: [...existing.features, ...saved.features],
        }
      : saved;

  dispatch(elevationChartClose());

  // Not a server-shared track, so it carries no id to share it back by.
  dispatch(trackViewerSetTrackUID(null));

  dispatch(trackViewerSetData({ trackGeojson }));

  // The track viewer's own toolbar is where the saved copy is worked on, so
  // open it beside the recorder rather than replacing it.
  dispatch(setTool({ tool: 'import-file', mode: 'open' }));
};
