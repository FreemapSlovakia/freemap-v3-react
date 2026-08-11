import { isToolOpen } from '@app/store/selectors.js';
import type { MyStore } from '@app/store/store.js';
import {
  type GpsRecorderConnection,
  gpsRecorderAddPoints,
  gpsRecorderPushedStatus,
  gpsRecorderSetConnection,
  gpsRecorderSync,
} from './model/actions.js';
import { startRecorderSpan, watchRecorderFrame } from './perfProbe.js';
import {
  decodePoints,
  RECORDER_ORIGIN,
  RecorderError,
  type RecorderPoint,
  RecorderStatusSchema,
  streamPayloadToRows,
} from './protocol.js';
import { gpsRecorderPlatformSupported } from './support.js';

/**
 * The live view of the recorder: the `/stream` connection, the sync that feeds
 * it, and the retries when either goes.
 *
 * **One owner, reconciling a desired state.** Everything that could change the
 * answer — the page coming and going, the tool opening, a stream the browser
 * dropped, a sync that failed — calls {@link reconcileRecorderConnection}, which
 * compares what should be connected against what is and fixes the difference.
 * Nothing else holds a handle, a timer or a flag, so there is one place that
 * decides whether to connect, one backoff, and one answer for what the toolbar
 * should say.
 *
 * **Hidden means disconnected.** A page that is hidden may be frozen the next
 * moment, and an `EventSource` frozen with it comes back reporting `OPEN` while
 * nothing arrives on it — loopback delivers no reset for the browser to notice,
 * so it believes in the socket for tens of seconds, then replays every fix above
 * its last event id in one burst. Rather than keep such a stream and distrust
 * it, going away closes it and the run in flight with it. Nothing is lost: the
 * recorder owns the track, and coming back catches up over `/track?since=`.
 */

/**
 * Whether the recorder is worth following: it was recording, or holding a track,
 * the last time this browser looked.
 *
 * In `localStorage` rather than in the store, because the question outlives the
 * page — a recording carries on in the phone's own app while the browser is
 * closed, and on the next load nothing else knows there is anything to fetch.
 * Deliberately not in `persistence.ts`: that subset is re-serialized on every
 * action, and this changes when a recording starts or ends.
 */
const KEY = 'fm.gpsRecorder.follow';

function readFollowed(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
}

// Cached, because the desired state is resolved often enough that reading
// storage each time would be a syscall per reconcile.
let followed = readFollowed();

/**
 * Set from the recorder's own answer — recording, or holding points — by
 * `applyStatus`, and cleared when the retries give up on a recorder nobody is
 * looking at.
 */
export function setRecorderFollowed(value: boolean): void {
  if (value === followed) {
    return;
  }

  followed = value;

  try {
    if (value) {
      localStorage.setItem(KEY, 'true');
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // Storage denied (private mode, a blocked origin); following then lasts only
    // as long as the page does, which is no worse than not trying.
  }

  // Following is an input to the desired state, so changing it goes through the
  // one owner like every other input. This is what closes the stream when a
  // finished ride leaves nothing to follow — the menu is gone by then, so no
  // unmount is coming to do it — and what resets the backoff when the chain
  // gives up, so the next look starts fresh.
  reconcileRecorderConnection();
}

/** The store, held so every transition can publish what it changed. */
let store: MyStore | null = null;

/** The stream, when one is attached. */
let source: EventSource | null = null;

/**
 * Column order for the bare rows the stream sends. Set before the stream is ever
 * opened — `/status` names it, and the status frame on connect names it again.
 */
let fields: readonly string[] = [];

/** The sync in flight, if any; aborting it is how a teardown stops one. */
let run: {
  promise: Promise<void>;
  quiet: boolean;
  controller: AbortController;
} | null = null;

/** Catch-ups downloading right now, for what the toolbar says. */
let catchingUp = 0;

/**
 * A sync asked for whose handler — a lazily loaded chunk — has not started yet.
 * It counts as an attempt in progress, so nothing asks for a second one in the
 * gap and the toolbar does not blink through `idle` on the way in.
 */
let syncPending = false;

/**
 * How long that gap may last before the ask is written off. The handler claims it
 * as soon as it runs, so this only expires when the chunk never arrives at all —
 * a hashed file that a deploy has moved, or a network that dropped mid-import.
 * Without it the flag would stick, and with it the connection: reading
 * `connecting` for good, and refusing to ask again because something already had.
 */
const SYNC_CLAIM_MS = 10_000;

let syncClaimTimer: ReturnType<typeof setTimeout> | null = null;

function clearSyncPending(): void {
  syncPending = false;

  if (syncClaimTimer !== null) {
    clearTimeout(syncClaimTimer);

    syncClaimTimer = null;
  }
}

/**
 * Whether the live view was working before the attempt now under way.
 *
 * It decides whether a failure is worth saying out loud: a stream that was
 * carrying fixes and stopped is news — the distance and the clock have stopped
 * with it — while one that never came up is what a page returning to a recorder
 * that has since been uninstalled looks like, and nobody asked about that.
 */
let wasLive = false;

/**
 * Backoff after a connection that failed, whether the stream was dropped or the
 * sync could not reach the recorder. A recorder Android killed comes back on its
 * own often enough to be worth waiting for, and rarely enough that hammering
 * loopback would be pointless — so the wait widens, and then this gives up: a
 * page left open for a week must not go on asking every half minute.
 */
const RETRY_DELAYS = [1000, 2000, 5000, 10_000, 30_000];

let retryAttempt = 0;

let retryTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * What the connection is doing, as one derived answer. `connecting` is an attempt
 * under way — a sync in flight, or a stream not open yet; `reconnecting` is the
 * wait before the next one.
 */
function connectionState(): GpsRecorderConnection {
  if (catchingUp > 0) {
    return 'syncing';
  }

  if (source?.readyState === EventSource.OPEN) {
    return 'live';
  }

  if (run !== null || syncPending || source !== null) {
    return 'connecting';
  }

  return retryTimer === null ? 'idle' : 'reconnecting';
}

/**
 * Publishes that answer. Called after every transition, so no path can leave the
 * toolbar spinning on a wait that finished — the class of bug a `syncing` set on
 * the way in and forgotten on the way out used to be.
 */
function publish(): void {
  store?.dispatch(gpsRecorderSetConnection(connectionState()));
}

function cancelRetry(): void {
  if (retryTimer !== null) {
    clearTimeout(retryTimer);

    retryTimer = null;
  }
}

/** Drops everything: the stream, the sync in flight, the retry, the queue. */
function teardown(): void {
  cancelRetry();

  retryAttempt = 0;

  clearSyncPending();

  wasLive = false;

  discardQueuedRecorderPoints();

  run?.controller.abort();

  run = null;

  source?.close();

  source = null;
}

/** Whether there should be a connection at all. */
function wanted(): boolean {
  return (
    gpsRecorderPlatformSupported &&
    document.visibilityState === 'visible' &&
    store !== null &&
    (followed || isToolOpen(store.getState(), 'gps-recorder'))
  );
}

/**
 * Brings the connection into line with whether there should be one, and says so.
 * Idempotent, and the only way in: call it after anything that could change the
 * answer.
 *
 * A sync in flight, a stream in hand or a retry pending all count as something
 * already being on it, so this never starts a second attempt in parallel with
 * the first.
 */
export function reconcileRecorderConnection(): void {
  if (!wanted()) {
    teardown();

    publish();

    return;
  }

  if (source === null && run === null && retryTimer === null && !syncPending) {
    syncPending = true;

    syncClaimTimer = setTimeout(() => {
      clearSyncPending();

      // Nothing ever ran, so this is a failed attempt like any other.
      retry();

      publish();
    }, SYNC_CLAIM_MS);

    // Quiet unless a live view was lost: a recorder that has since been killed
    // or uninstalled must not greet the user with an error they did nothing to
    // provoke, but a ride whose figures have just stopped advancing is worth
    // saying out loud.
    store?.dispatch(gpsRecorderSync({ quiet: !wasLive }));
  }

  publish();
}

/**
 * Schedules the next attempt, or ends the chain.
 *
 * Reviving re-runs the whole sync rather than just reopening the socket, because
 * whatever killed the stream may equally have stopped the recording or cleared
 * the track — and the catch-up is what notices.
 *
 * Running out of attempts is what finally stops the page following a recording,
 * and only then: one failure is routinely a page that was frozen mid-request, so
 * giving up on that alone would leave a ride that is still being recorded with
 * nothing watching it. With the tool open it does not give up at all — somebody
 * is looking at a panel that would otherwise stay dead until it was closed and
 * opened again — and keeps asking at the longest interval instead.
 */
function retry(): void {
  // A stream in hand is a live view that is working, however a sync that ran
  // beside it went; its own `onerror` drops it and starts this chain if it
  // breaks. Arming here would spend the attempts on a connection that is not
  // broken.
  if (retryTimer !== null || source !== null || !wanted()) {
    return;
  }

  const delay = RETRY_DELAYS[retryAttempt];

  if (
    delay === undefined &&
    (store === null || !isToolOpen(store.getState(), 'gps-recorder'))
  ) {
    setRecorderFollowed(false);

    return;
  }

  if (delay !== undefined) {
    retryAttempt++;
  }

  retryTimer = setTimeout(() => {
    retryTimer = null;

    reconcileRecorderConnection();
  }, delay ?? RETRY_DELAYS.at(-1));
}

/**
 * The sync in flight, if any. Several things ask for one at nearly the same
 * moment — returning to the page with the tool open raises both the reconcile
 * and the menu's own — and they all want the same answer, so the later ones wait
 * instead of fetching the whole track again. `quiet` is the weakest claim any
 * waiter made: one caller who asked out loud is enough for a failure to be
 * reported out loud.
 *
 * `restart` is for the caller that cannot be answered by a run already in
 * flight: the start flow needs a status newer than its own `POST /start`, and a
 * pushed status carries a change the running sync read too early to see. It
 * abandons whatever is running and asks again.
 *
 * `start` is the sync itself, which lives in the lazily loaded handlers: this
 * owns when it runs and when it is abandoned, not what it does.
 */
export function runRecorderSync(
  { quiet, restart = false }: { quiet: boolean; restart?: boolean },
  start: (signal: AbortSignal, isQuiet: () => boolean) => Promise<void>,
): Promise<void> {
  clearSyncPending();

  if (run) {
    if (!restart) {
      run.quiet &&= quiet;

      return run.promise;
    }

    // The weakest claim survives the restart: the replaced run may have been
    // somebody's loud ask, and this run is what answers it now.
    quiet &&= run.quiet;

    run.controller.abort();

    run = null;
  }

  const entry = {
    quiet,
    controller: new AbortController(),
    promise: Promise.resolve(),
  };

  run = entry;

  entry.promise = start(entry.controller.signal, () => entry.quiet).finally(
    () => {
      if (run === entry) {
        run = null;
      }

      // The run itself is part of the answer, so its end has to be published
      // like any other transition — otherwise a resync over a stream that was
      // already live leaves the toolbar reading `connecting` for good.
      publish();
    },
  );

  publish();

  return entry.promise;
}

/**
 * Runs a catch-up, with the connection reading as `syncing` for as long as it
 * takes. Bracketed rather than announced, so the state cannot be left behind by
 * a path that returned early — which is every path a failure takes.
 */
export async function whileCatchingUp<T>(fetch: () => Promise<T>): Promise<T> {
  catchingUp++;

  publish();

  try {
    return await fetch();
  } finally {
    catchingUp--;

    publish();
  }
}

/**
 * How a sync ended, and the only thing a caller has to say. Success carries the
 * column order the stream needs to decode its bare rows; failure carries what
 * went wrong, since two causes are worth no retry at all.
 */
export function recorderSyncSettled(
  outcome: { fields: readonly string[] } | { error: unknown },
): void {
  if ('error' in outcome) {
    // A refusal will not turn into a grant, and an old APK will not update
    // itself, by asking again.
    const hopeless =
      outcome.error instanceof RecorderError &&
      (outcome.error.failure === 'lna-denied' ||
        outcome.error.failure === 'outdated');

    if (hopeless) {
      cancelRetry();
    } else {
      retry();
    }

    publish();

    return;
  }

  // Kept current even for an already-open stream: a resync may have read a newer
  // column order than the one this stream opened with.
  fields = outcome.fields;

  cancelRetry();

  // `retryAttempt` is deliberately not reset here: a sync succeeding proves only
  // `/status`, and the backoff guards the stream. Resetting on it would let a
  // recorder whose `/stream` alone is broken hold the chain at the first delay
  // forever — sync OK, attach, error, retry — instead of widening and giving up.
  // The stream coming up is what proves the connection, so `onopen` is the reset.
  if (!wanted()) {
    // The page went away while the sync was finishing. Attaching now would only
    // hand out a stream that is frozen from birth.
    teardown();
  } else if (source === null) {
    attachStream();
  }

  publish();
}

/**
 * Opens the live view.
 *
 * `EventSource` cannot pass `targetAddressSpace`, so this only works once the
 * Local Network Access permission has been granted by an earlier gestured fetch.
 * That is why the start flow calls `/status` first.
 */
function attachStream(): void {
  const es = new EventSource(`${RECORDER_ORIGIN}/stream`);

  source = es;

  es.onopen = () => {
    retryAttempt = 0;

    wasLive = true;

    publish();
  };

  es.onmessage = (event) => {
    const points = parsePoints(event.data);

    if (points) {
      queuePoints(points);
    }
  };

  // Arrives before any point on every connection, and names the columns as well
  // as the state — so a stream that outlives a `/status` read still decodes the
  // rows that follow it.
  es.addEventListener('status', (event) => {
    let json: unknown;

    try {
      json = JSON.parse(event.data);
    } catch {
      return;
    }

    const result = RecorderStatusSchema.safeParse(json);

    if (!result.success) {
      return;
    }

    fields = result.data.fields;

    store?.dispatch(gpsRecorderPushedStatus(result.data));
  });

  es.onerror = () => {
    if (source !== es) {
      return;
    }

    // Any error drops the handle and feeds the backoff above — deliberately not
    // left to the browser's own reconnection, which retries a dead loopback
    // forever with the toolbar reading `connecting` and never gives up. The
    // retry re-runs the whole sync, which also has the deadline and the
    // catch-up that the bare socket lacks.
    es.close();

    source = null;

    retry();

    publish();
  };
}

/**
 * Points arrive an event at a time, and each dispatch costs a pass over the whole
 * track: the merge, the segment split, the polyline Leaflet reprojects and the
 * statistics fold. One a second is nothing. A burst of them — a recorder that had
 * been buffering, or a phone whose screen has just come back on — is the same work
 * repeated per fix, which is the stall the user sees as a frozen map. Whatever
 * arrives together is therefore dispatched together.
 */
const BATCH_MS = 250;

let batch: RecorderPoint[] = [];

let batchTimer: ReturnType<typeof setTimeout> | null = null;

function queuePoints(points: RecorderPoint[]): void {
  batch.push(...points);

  if (batchTimer === null) {
    batchTimer = setTimeout(() => {
      batchTimer = null;

      const flushed = batch;

      batch = [];

      // The merge and every subscriber that runs inside the dispatch; the frame
      // probe then covers what it scheduled — the React render, and the polyline
      // Leaflet reprojects and redraws.
      const dispatched = startRecorderSpan('points-dispatch');

      store?.dispatch(gpsRecorderAddPoints(flushed));

      dispatched(flushed.length);

      watchRecorderFrame('points-frame', flushed.length);
    }, BATCH_MS);
  }
}

/**
 * Drops what has not been dispatched yet. Nothing is lost: the points were never
 * merged, so the cursor does not claim them and the next sync fetches them again.
 *
 * Exported for the one case where it is not merely an optimisation: a track that
 * has just been discarded. The queue belongs to the track that is going, and
 * flushing it afterwards would put deleted fixes back on the map.
 */
export function discardQueuedRecorderPoints(): void {
  if (batchTimer !== null) {
    clearTimeout(batchTimer);

    batchTimer = null;
  }

  batch = [];
}

function parsePoints(data: string): RecorderPoint[] | null {
  let json: unknown;

  try {
    json = JSON.parse(data);
  } catch {
    return null;
  }

  // A row, or a batch of them; anything else is not a point event.
  if (!Array.isArray(json)) {
    return null;
  }

  return decodePoints(fields, streamPayloadToRows(json));
}

/**
 * Installed at boot, beside the app's other attach helpers.
 *
 * The connection is deliberately not the toolbar's: a recording carries on
 * whichever toolbar the user has open, and on the phone even while the browser
 * is closed, so neither closing the tool nor a reload says anything about
 * whether there is still something to follow.
 */
export function attachRecorderConnection(newStore: MyStore): void {
  store = newStore;

  if (!gpsRecorderPlatformSupported) {
    return;
  }

  document.addEventListener('visibilitychange', reconcileRecorderConnection);

  reconcileRecorderConnection();
}
