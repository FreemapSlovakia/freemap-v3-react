import { openTool } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import {
  dataViewerSetData,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import { storeTrackDurably } from '@features/dataViewer/trackStore.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import type { FeatureCollection } from 'geojson';
import type { Dispatch } from 'redux';
import {
  discardQueuedRecorderPoints,
  runRecorderSync,
  seedRecorderFields,
  setRecorderFollowed,
  whileCatchingUp,
} from '../connection.js';
import type { SyncOutcome } from '../connectionCore.js';
import { startRecorderSpan, watchRecorderFrame } from '../perfProbe.js';
import {
  isHopelessFailure,
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
  startRecording,
  stopRecording,
  waitForRecording,
  waitForStatus,
} from '../recorderClient.js';
import { recorderSegmentsToFeatureCollection } from '../trackGeojson.js';
import {
  gpsRecorderAddPoints,
  type gpsRecorderPushedStatus,
  gpsRecorderSetError,
  gpsRecorderSetPending,
  gpsRecorderSetStatus,
  type gpsRecorderStop,
  type gpsRecorderSync,
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

  forgetUnreachableStatus(dispatch, err);
}

/**
 * Drops the last status when nothing answered at all.
 *
 * It described a recorder this page can no longer see, and everything read from
 * it is then a claim about the past: the readout would say `Stopped` for an app
 * that has been killed, and the setup warning would go on advising about a
 * recording that cannot start. Whether it is set up is the recorder's news to
 * give, and it is not giving any.
 */
function forgetUnreachableStatus(dispatch: Dispatch, err: unknown): void {
  if (
    err instanceof RecorderError &&
    (err.failure === 'unreachable' || err.failure === 'lna-denied')
  ) {
    dispatch(gpsRecorderSetStatus(null));
  }
}

/**
 * Drops the copy of a track the recorder no longer has — deleted here, deleted
 * from elsewhere, or handed over.
 *
 * The queued fixes go with it. They belong to the track that is going, and a
 * batch flushing after the reducer has emptied the points would put deleted
 * fixes back on the map until the next status corrected it.
 */
function clearHeldTrack(dispatch: Dispatch): void {
  discardQueuedRecorderPoints();

  dispatch(gpsRecorderTrackCleared());
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

/** What this page holds, in the terms {@link applyStatus} compares against. */
function heldTrack(getState: () => RootState): {
  points: number;
  cursor: number;
  generation: number | null;
} {
  const { points, cursor, generation } = getState().gpsRecorder;

  return { points: points.length, cursor, generation };
}

/**
 * Reconciles a status with the track held here, fetching whatever the recorder
 * has that this page hasn't.
 */
async function applyStatus(
  dispatch: Dispatch,
  status: RecorderStatus,
  held: { points: number; cursor: number; generation: number | null },
  signal?: AbortSignal,
): Promise<void> {
  // Checked wherever a status lands, not only on the way into a recording: a
  // recorder too old for these endpoints is told so as soon as the tool is
  // opened, with the update link the failure carries.
  assertSupportedVersion(status);

  // Before any stream is attached — this run may be the one that attaches it,
  // and a stream whose own connect frame does not parse has nothing else to
  // decode its rows with.
  seedRecorderFields(status.fields);

  // `seq` never restarts, so a cleared track is indistinguishable from one that
  // simply hasn't grown — a bumped `generation` is the only reliable signal that
  // what we hold is gone. Asking for everything after a stale cursor would leave
  // the deleted track on screen forever.
  const cleared =
    held.generation !== null && status.generation !== held.generation;

  if (cleared) {
    clearHeldTrack(dispatch);
  }

  dispatch(gpsRecorderSetStatus(status));

  // Remembered for the next page load: a recording carries on in the phone's own
  // app while the browser is closed, and nothing else would know to go looking.
  setRecorderFollowed(status.recording || status.count > 0);

  // A cold start holds no points, so the whole track is refetched: the recorder
  // owns it, and the cursor only says what this page already has.
  const fromZero = cleared || held.points === 0;

  // `lastSeq` above the cursor means fixes are missing here — the page was
  // frozen in the background, or the stream is not attached at all. Both are
  // single comparisons against a status that has to be read anyway.
  if (status.count > 0 && (fromZero || status.lastSeq > held.cursor)) {
    // Bracketed, so the connection reads as `syncing` for exactly as long as the
    // download takes however this returns.
    const page = await whileCatchingUp(() =>
      getTrackSince(fromZero ? 0 : held.cursor, signal),
    );

    // The catch-up is the biggest single batch this feature ever merges — a page
    // that has been away for an hour comes back to every fix at once — so it is
    // measured apart from the stream's own.
    const merged = startRecorderSpan('catchup-dispatch');

    dispatch(gpsRecorderAddPoints(page.points));

    merged(page.points.length);

    watchRecorderFrame('catchup-frame', page.points.length);
  }
}

/**
 * Reconciles a fresh `/status` read and catches up on whatever it says is
 * missing, then reports the outcome through `settle`, which the connection
 * binds to this run — it decides what to do with it: attach the stream, or
 * retry.
 *
 * Runs when the tool opens, when the page returns to the foreground, when a
 * retry comes due, whenever the stream pushes a status, and at the end of the
 * start, pause and clear flows. Never on a timer: the stream says when
 * something changed.
 *
 * `isQuiet` is read at the moment a failure happens rather than on the way in,
 * because callers may have joined this run since it started — see
 * `runRecorderSync`.
 */
async function runSync(
  { dispatch, getState }: { dispatch: Dispatch; getState: () => RootState },
  isQuiet: () => boolean,
  signal: AbortSignal | undefined,
  settle: (outcome: SyncOutcome) => void,
): Promise<void> {
  // Read before the fresh status lands, so the generation compared below is the
  // one this page's points were fetched under.
  const held = heldTrack(getState);

  // How long the live view takes to come back, which is the other half of what
  // is being chased here. Mostly a wait rather than work, so the bar is high:
  // only a sync that took long enough for the user to notice is worth a line.
  const synced = startRecorderSpan('sync', 4000);

  // Whether the recorder answered at all, which decides whether a failure below
  // counts against it: everything after the status — the catch-up transfer, the
  // page this app could not read — failed with the recorder demonstrably there.
  let answered = false;

  try {
    const status = await getStatus(signal);

    answered = true;

    await applyStatus(dispatch, status, held, signal);
  } catch (err) {
    synced();

    // Abandoned by a teardown or a restart — the page went away, or a newer
    // caller took over. Nothing is reported and nothing is retried: whatever
    // abandoned this run owns what happens next.
    if (signal?.aborted) {
      return;
    }

    // A quiet sync is one nobody asked for, so it says nothing: the recorder has
    // been killed, uninstalled, or is simply not there any more, and telling the
    // user about a request they did not make helps nobody.
    if (isQuiet()) {
      forgetUnreachableStatus(dispatch, err);
    } else {
      reportFailure(dispatch, err);
    }

    settle({
      ok: false,
      hopeless: isHopelessFailure(err),
      recorderFailed: !answered,
    });

    return;
  }

  synced(getState().gpsRecorder.points.length);

  // Cleared whatever became of this run: the recorder answered, so a failure
  // still on screen is describing something that is no longer true. A run can
  // abandon itself here — `applyStatus` unfollowing an emptied recorder tears
  // the connection down — and that is exactly the case where nothing else is
  // coming to clear it.
  dispatch(gpsRecorderSetError(null));

  settle({ ok: true });
}

/** Runs the shared sync through the connection under the given claim. */
function requestSync(
  params: { dispatch: Dispatch; getState: () => RootState },
  opts: { quiet: boolean; restart?: boolean },
): Promise<void> {
  return runRecorderSync(opts, (signal, isQuiet, settle) =>
    runSync(params, isQuiet, signal, settle),
  );
}

export const syncHandler: ProcessorHandler<typeof gpsRecorderSync> = (params) =>
  requestSync(params, { quiet: params.action.payload?.quiet ?? false });

/**
 * A status the stream pushed. The push is a doorbell, not a payload: this
 * re-reads `/status` and reconciles that, rather than applying the pushed
 * frame — a frame is composed at the recorder's own moment and can be older
 * than what a sync in flight has already read, and applying it blind would
 * move `recording`, `count` and `lastSeq` backwards with nothing to correct
 * them until the next push. A fresh read is one loopback round trip, and
 * pushes are rare, discrete events.
 *
 * `restart`, because a run already in flight read its status before the push
 * arrived: joining it would drop the very change — a stop, a clear — the push
 * exists to deliver. Quiet, except for the loudness it inherits from a run it
 * restarted.
 */
export const pushedStatusHandler: ProcessorHandler<
  typeof gpsRecorderPushedStatus
> = (params) => requestSync(params, { quiet: true, restart: true });

/** Begins recording. */
export const startHandler: ProcessorHandler = async (params) => {
  const { dispatch, getState } = params;

  const config = recorderConfigOf(getState().gpsRecorderSettings);

  dispatch(gpsRecorderSetError(null));

  // The spinner over the Record button is this, not the connection: what the
  // user is waiting for is the command they gave.
  dispatch(gpsRecorderSetPending(true));

  // Deliberately touches nothing but the failure: this flow changes what the
  // recorder is doing, not what the page is connected to, so there is no
  // connection state to put back. Asking for a reconcile here would raise a sync
  // that succeeds — the recorder answers `/status` perfectly well while refusing
  // to record — and clearing the error takes the toast that says why with it.
  const fail = (err: unknown) => {
    dispatch(gpsRecorderSetPending(false));

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
      // the user is looking at, and which only a battery-optimisation exemption
      // lifts. So hand the job to the recorder's own activity, where the same
      // call is allowed. The config asked for above is already saved on its
      // side, so the recording it starts is the one that was requested.
      window.location.href = RECORDER_INTENT_URL;

      await waitForRecording();
    }
  } catch (err) {
    fail(err);

    return;
  }

  dispatch(gpsRecorderSetPending(false));

  // The sync reads a status of its own and reconciles it, which is also why none
  // is read here: a raw `gpsRecorderSetStatus` would carry the recorder's
  // `generation` into the store without the comparison that gives it meaning, and
  // a `DELETE /track` that happened while the stream was down would then pass
  // unnoticed — leaving the deleted points merged into the new recording.
  //
  // `restart`, because this needs a status newer than the `POST /start` above and
  // a run already in flight could answer with one read before it — the flow
  // returns from the launch intent through a `visibilitychange`, which raises one.
  // Never quiet: the user asked for this recording.
  await requestSync(params, { quiet: false, restart: true });
};

/**
 * Suspends the recording — the recorder's own `POST /stop`, which keeps the track
 * and opens a new segment on the next start. Nothing has to be remembered about
 * where it stopped: the recorder bumps `seg`, and that is what splits the track.
 */
export const pauseHandler: ProcessorHandler = async (params) => {
  const { dispatch } = params;

  dispatch(gpsRecorderSetPending(true));

  try {
    await stopRecording();

    // Through the sync rather than a direct status read: it coalesces with
    // anything else asking, and any reconcile it provokes joins this run
    // instead of racing it. `restart` guarantees a status newer than the
    // `POST /stop` above; loud, because the user asked — the sync reports its
    // own failures.
    await requestSync(params, { quiet: false, restart: true });
  } catch (err) {
    reportFailure(dispatch, err);
  } finally {
    dispatch(gpsRecorderSetPending(false));
  }
};

/**
 * Discards the recorder's track, then the local copy of it. Ordered that way on
 * purpose: if the delete fails, the screen still shows what the recorder holds
 * rather than pretending it is gone.
 *
 * Only ever the recorder's copy. Once a ride has been finished it belongs to the
 * track viewer, and deleting it there is what throws it away.
 */
export const clearHandler: ProcessorHandler = async (params) => {
  const { dispatch } = params;

  try {
    await clearTrack();
  } catch (err) {
    reportFailure(dispatch, err);

    return;
  }

  clearHeldTrack(dispatch);

  dispatch(gpsRecorderSetError(null));

  // Through the sync rather than a direct status read: it reconciles the
  // emptied recorder — which is also what tells the connection there is
  // nothing left to follow — and reports its own failures.
  await requestSync(params, { quiet: false, restart: true });
};

/**
 * Puts the recording into the track viewer, where it becomes an ordinary loaded
 * track: elevation, colorize, the chart and every export target then work on it
 * without the recorder knowing anything about them.
 *
 * Returns what the viewer now holds, so a caller that has to make the copy
 * durable knows exactly what to store.
 */
function handOverTrack(
  dispatch: Dispatch,
  state: RootState,
  mode: 'replace' | 'append',
): FeatureCollection | null {
  const saved = recorderSegmentsToFeatureCollection(
    selectRecorderSegments(state),
  );

  if (saved.features.length === 0) {
    return null;
  }

  const existing = state.trackViewer.trackGeojson;

  const trackGeojson: FeatureCollection =
    mode === 'append' && existing
      ? {
          type: 'FeatureCollection',
          features: [...existing.features, ...saved.features],
        }
      : saved;

  dispatch(elevationChartClose());

  // Not a server-shared track, so it carries no id to share it back by.
  dispatch(dataViewerSetTrackUID(null));

  dispatch(dataViewerSetData({ trackGeojson }));

  // The track viewer's own toolbar is where the saved copy is worked on, so it
  // takes over from the recorder's.
  dispatch(openTool('import-file'));

  return trackGeojson;
}

/**
 * Ends a ride: suspend the recording, hand the track over, keep a copy in this
 * browser, and only then let the recorder discard its own — so the ride isn't
 * left sitting on the phone *and* in the app, which is the duplicate this exists
 * to avoid.
 *
 * The order is the whole point. The recorder's copy is deleted last, and only if
 * the browser both stored the track and promised to keep it; anything less and the
 * recording stays where it is, with the reason said out loud. Deleting the only
 * copy of a ride is not something to be optimistic about.
 */
export const stopHandler: ProcessorHandler<typeof gpsRecorderStop> = async ({
  dispatch,
  getState,
  action,
}) => {
  dispatch(gpsRecorderSetPending(true));

  try {
    if (getState().gpsRecorder.status?.recording) {
      await stopRecording();
    }

    // Catch up *before* taking the track, and refuse to take it at all unless the
    // page holds every fix the recorder does. What this page holds is only what
    // reached it: a tab that was frozen in the background, or whose stream died,
    // is routinely behind — and handing over a truncated ride and then deleting
    // the complete one is the one mistake this whole flow exists to avoid.
    const held = heldTrack(getState);

    const status = await getStatus();

    await applyStatus(dispatch, status, held);

    if (getState().gpsRecorder.cursor !== status.lastSeq) {
      throw new RecorderError(
        'incomplete',
        `page holds up to ${getState().gpsRecorder.cursor}, recorder has ${status.lastSeq}`,
      );
    }

    const trackGeojson = handOverTrack(dispatch, getState(), action.payload);

    if (trackGeojson === null) {
      return;
    }

    // The track viewer stores what it is given anyway; this is the same write,
    // awaited and answered, because what comes next is irreversible. Anything but
    // a durable copy leaves the recording where it is: `evictable` means the
    // browser may reclaim it, `unreadable` means it would not have come back at
    // all — and neither is good enough to be the only copy of a ride.
    const outcome = await storeTrackDurably(trackGeojson);

    if (outcome !== 'durable') {
      throw new RecorderError(
        outcome === 'evictable' ? 'not-persisted' : 'not-stored',
        `the copy in this browser is ${outcome}`,
      );
    }

    await clearTrack();

    clearHeldTrack(dispatch);

    // Through `applyStatus` like every other status: it is what tells the
    // connection the ride is over and there is nothing left to follow. A raw
    // dispatch would leave the page following a recorder it has just emptied,
    // this session and on the next load.
    await applyStatus(dispatch, await getStatus(), heldTrack(getState));
  } catch (err) {
    reportFailure(dispatch, err);
  } finally {
    dispatch(gpsRecorderSetPending(false));
  }
};
