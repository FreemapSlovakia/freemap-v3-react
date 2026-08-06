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
import { type RecorderBackend, recorderBackend } from '../backend.js';
import { setRecorderFollowed } from '../follow.js';
import {
  RecorderError,
  type RecorderStatus,
  truncateDetail,
} from '../protocol.js';
import { assertSupportedVersion } from '../recorderClient.js';
import { recorderSegmentsToFeatureCollection } from '../trackGeojson.js';
import {
  gpsRecorderAddPoints,
  type gpsRecorderPushedStatus,
  gpsRecorderSetConnection,
  gpsRecorderSetError,
  gpsRecorderSetPending,
  gpsRecorderSetSettings,
  gpsRecorderSetStatus,
  type gpsRecorderStop,
  type gpsRecorderSync,
  gpsRecorderTrackCleared,
} from './actions.js';
import { selectRecorderSegments } from './selectors.js';

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
 * Reconciles a status — however it arrived — with the track held here, fetching
 * whatever the recorder has that this page hasn't. Returns the point column
 * order it learned, for the stream to decode its bare rows with.
 */
async function applyStatus(
  dispatch: Dispatch,
  backend: RecorderBackend,
  status: RecorderStatus,
  held: { points: number; cursor: number; generation: number | null },
): Promise<readonly string[]> {
  // Checked wherever a status lands, not only on the way into a recording: a
  // recorder too old for these endpoints is told so as soon as the tool is
  // opened, with the update link the failure carries.
  assertSupportedVersion(status);

  // `seq` never restarts, so a cleared track is indistinguishable from one that
  // simply hasn't grown — a bumped `generation` is the only reliable signal that
  // what we hold is gone. Asking for everything after a stale cursor would leave
  // the deleted track on screen forever.
  const cleared =
    held.generation !== null && status.generation !== held.generation;

  if (cleared) {
    dispatch(gpsRecorderTrackCleared());
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
    dispatch(gpsRecorderSetConnection('syncing'));

    const page = await backend.getTrackSince(fromZero ? 0 : held.cursor);

    dispatch(gpsRecorderAddPoints(page.points));

    return page.fields;
  }

  return status.fields;
}

/**
 * Catches up over `/track?since=` and leaves the live stream attached. Runs when
 * the tool opens, when the page returns to the foreground, after the stream has
 * been given up on, and at the end of the start flow. Never on a timer: the
 * stream pushes a status whenever the recorder's state changes.
 *
 * `isQuiet` is read at the moment a failure happens rather than on the way in,
 * because callers may have joined this run since it started — see
 * {@link syncHandler}.
 */
async function runSync(
  { dispatch, getState }: { dispatch: Dispatch; getState: () => RootState },
  isQuiet: () => boolean,
): Promise<void> {
  // Read before the fresh status lands, so the generation below is the one this
  // page's points were fetched under.
  const { points, cursor, generation } = getState().gpsRecorder;

  const backend = recorderBackend(getState());

  // A stream held over from a hidden page is about to be replaced, so it counts
  // as no stream: the connection is being made again, not merely caught up.
  if (!backend.isStreamUsable()) {
    dispatch(gpsRecorderSetConnection('connecting'));
  }

  // Captured before anything is awaited: the tool can be closed mid-sync, and
  // what follows must not resurrect the stream it just closed.
  const since = backend.streamGeneration();

  let fields: readonly string[];

  try {
    fields = await applyStatus(dispatch, backend, await backend.getStatus(), {
      points: points.length,
      cursor,
      generation,
    });
  } catch (err) {
    // A failed catch-up says nothing about an already-working stream, so it is
    // only reported — the browser keeps the stream and its retries alive. The
    // connection goes back to whatever the stream is actually doing, so a `syncing`
    // that never completed doesn't spin forever with the transport disabled.
    //
    // A quiet sync is one nobody asked for, so it says nothing and stops
    // following instead: the recorder has been killed, uninstalled, or is simply
    // not there any more, and opening the tool is what tries again.
    if (isQuiet()) {
      setRecorderFollowed(false);

      forgetUnreachableStatus(dispatch, err);
    } else {
      reportFailure(dispatch, err);
    }

    backend.reportStreamState(dispatch);

    return;
  }

  dispatch(gpsRecorderSetError(null));

  backend.attachStream(dispatch, fields, since);
}

/**
 * The sync in flight, if any. Several things ask for one at nearly the same
 * moment — returning to the page with the tool open raises both the
 * `visibilitychange` sync and the menu's own — and they all want the same
 * answer, so the later ones wait instead of fetching the whole track again.
 *
 * `quiet` is the weakest claim any waiter made: one caller who asked out loud is
 * enough for a failure to be reported out loud.
 */
let inFlightSync: { promise: Promise<void>; quiet: boolean } | null = null;

export const syncHandler: ProcessorHandler<typeof gpsRecorderSync> = (
  params,
) => {
  const quiet = params.action.payload?.quiet ?? false;

  if (inFlightSync) {
    inFlightSync.quiet &&= quiet;

    return inFlightSync.promise;
  }

  const entry: { promise: Promise<void>; quiet: boolean } = {
    quiet,
    promise: Promise.resolve(),
  };

  inFlightSync = entry;

  entry.promise = runSync(params, () => entry.quiet).finally(() => {
    if (inFlightSync === entry) {
      inFlightSync = null;
    }
  });

  return entry.promise;
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

  const backend = recorderBackend(getState());

  const since = backend.streamGeneration();

  try {
    const fields = await applyStatus(dispatch, backend, action.payload, {
      points: points.length,
      cursor,
      generation,
    });

    // Idempotent for an already-open stream; this only refreshes the column
    // order and restores the connection state the catch-up moved off `live`.
    backend.attachStream(dispatch, fields, since);
  } catch (err) {
    reportFailure(dispatch, err);

    backend.reportStreamState(dispatch);
  }
};

/**
 * Begins recording. Everything about *how* — the launch intent, the Local
 * Network Access prompt, the location permission — belongs to the backend; what
 * is left here is the same either way.
 */
export const startHandler: ProcessorHandler = async (params) => {
  const { dispatch, getState } = params;

  const backend = recorderBackend(getState());

  dispatch(gpsRecorderSetError(null));

  dispatch(gpsRecorderSetPending(true));

  dispatch(gpsRecorderSetConnection('connecting'));

  try {
    await backend.start();
  } catch (err) {
    backend.closeStream();

    dispatch(gpsRecorderSetPending(false));

    dispatch(gpsRecorderSetConnection('idle'));

    reportFailure(dispatch, err);

    return;
  }

  dispatch(gpsRecorderSetPending(false));

  // The sync reads a status of its own and reconciles it, which is also why none
  // is read here: a raw `gpsRecorderSetStatus` would carry the recorder's
  // `generation` into the store without the comparison that gives it meaning, and
  // a `DELETE /track` that happened while the stream was down would then pass
  // unnoticed — leaving the deleted points merged into the new recording.
  //
  // `runSync` rather than `syncHandler`: this needs a status newer than the
  // `POST /start` above, and joining a sync already in flight could answer with
  // one read before it. Never quiet — the user asked for this recording.
  await runSync(params, () => false);
};

/**
 * Takes the browser fallback and records straight away.
 *
 * The settings change lands before the start reads them, so this begins the
 * recording the user asked for rather than merely reconfiguring and waiting to
 * be asked again — which, on the toast that says the recorder did not answer, is
 * the whole point of the offer.
 */
export const useBrowserHandler: ProcessorHandler = async (params) => {
  params.dispatch(gpsRecorderSetSettings({ backend: 'browser' }));

  await startHandler(params);
};

/**
 * Suspends the recording — the recorder's own `POST /stop`, which keeps the track
 * and opens a new segment on the next start. Nothing has to be remembered about
 * where it stopped: the recorder bumps `seg`, and that is what splits the track.
 */
export const pauseHandler: ProcessorHandler = async ({
  dispatch,
  getState,
}) => {
  const backend = recorderBackend(getState());

  dispatch(gpsRecorderSetPending(true));

  try {
    await backend.stop();

    // Through `applyStatus`, not a raw dispatch: it is what compares
    // `generation` before storing it, so a track cleared while the stream was
    // down is noticed here rather than absorbed silently.
    const { points, cursor, generation } = getState().gpsRecorder;

    await applyStatus(dispatch, backend, await backend.getStatus(), {
      points: points.length,
      cursor,
      generation,
    });
  } catch (err) {
    reportFailure(dispatch, err);
  } finally {
    dispatch(gpsRecorderSetPending(false));

    // The catch-up above moves the connection to `syncing`, and only the stream
    // knows what it should read as afterwards. Without this the button spins for
    // good on a pause that worked perfectly.
    backend.reportStreamState(dispatch);
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
export const clearHandler: ProcessorHandler = async ({
  dispatch,
  getState,
}) => {
  const backend = recorderBackend(getState());

  try {
    await backend.clear();
  } catch (err) {
    reportFailure(dispatch, err);

    return;
  }

  dispatch(gpsRecorderTrackCleared());

  dispatch(gpsRecorderSetError(null));

  try {
    dispatch(gpsRecorderSetStatus(await backend.getStatus()));
  } catch (err) {
    reportFailure(dispatch, err);
  }
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
  const backend = recorderBackend(getState());

  dispatch(gpsRecorderSetPending(true));

  try {
    if (getState().gpsRecorder.status?.recording) {
      await backend.stop();
    }

    // Catch up *before* taking the track, and refuse to take it at all unless the
    // page holds every fix the recorder does. What this page holds is only what
    // reached it: a tab that was frozen in the background, or whose stream died,
    // is routinely behind — and handing over a truncated ride and then deleting
    // the complete one is the one mistake this whole flow exists to avoid.
    const { points, cursor, generation } = getState().gpsRecorder;

    const status = await backend.getStatus();

    await applyStatus(dispatch, backend, status, {
      points: points.length,
      cursor,
      generation,
    });

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

    await backend.clear();

    dispatch(gpsRecorderTrackCleared());

    // Safe as a raw dispatch: the track was just cleared here, so the generation
    // this reports is the one the empty local copy belongs to.
    dispatch(gpsRecorderSetStatus(await backend.getStatus()));
  } catch (err) {
    reportFailure(dispatch, err);
  } finally {
    dispatch(gpsRecorderSetPending(false));

    // As in the pause: the catch-up left the connection reading as `syncing`,
    // which nothing else here undoes.
    backend.reportStreamState(dispatch);
  }
};
