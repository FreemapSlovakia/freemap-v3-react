import type { GpsRecorderConnection } from './model/actions.js';

/**
 * The connection's decision core: what to connect, when to retry, when to give
 * up, and what the toolbar should read — as a state machine over injected
 * effects, with no browser globals of its own. The shell in `connection.ts`
 * supplies the real `EventSource`, storage and store; the tests supply fakes
 * and drive the clock, which is the point: every rule here is pinned by a
 * fake-timer test in `connectionCore.test.ts` rather than by review.
 */

export type StreamHandle = {
  close(): void;
};

export type StreamCallbacks = {
  /** The response headers arrived; the browser considers the stream open. */
  onOpen(): void;

  /**
   * The connect status frame arrived. This — not `onOpen` — is what proves the
   * stream end to end: headers say only that a socket was accepted, and a
   * server killed right after accepting one would otherwise reset the backoff
   * on every cycle and keep it from ever widening.
   */
  onStatusFrame(): void;

  /** Any error. The core drops the handle and feeds the backoff. */
  onError(): void;
};

export type RecorderConnectionDeps = {
  isVisible(): boolean;

  isToolOpen(): boolean;

  readFollowed(): boolean;

  /** Persists the follow flag; returns whether the write took. */
  writeFollowed(value: boolean): boolean;

  /** Opens the SSE stream and wires its events to the given callbacks. */
  openStream(callbacks: StreamCallbacks): StreamHandle;

  /** Asks the app to run a sync (through the processor middleware). */
  dispatchSync(quiet: boolean): void;

  /** Publishes the derived connection state; called only when it changed. */
  publish(state: GpsRecorderConnection): void;

  /** A teardown happened; the shell drops anything queued from the stream. */
  onTeardown(): void;
};

export type SyncOutcome =
  | { ok: true }
  | {
      /** Whether retrying could help: a refused permission or an old APK won't. */
      ok: false;
      hopeless: boolean;
    };

export type SyncStart = (
  signal: AbortSignal,
  isQuiet: () => boolean,
  settle: (outcome: SyncOutcome) => void,
) => Promise<void>;

/**
 * Backoff after a connection that failed. A recorder Android killed comes back
 * on its own often enough to be worth waiting for, and rarely enough that
 * hammering loopback would be pointless — so the wait widens, and holds at the
 * longest interval once the delays run out.
 */
export const RETRY_DELAYS = [1000, 2000, 5000, 10_000, 30_000];

/**
 * How long a dispatched sync may go unclaimed by its lazily loaded handler
 * before the ask is written off as a failed attempt — a hashed chunk a deploy
 * has moved, or a network that dropped mid-import.
 */
export const SYNC_CLAIM_MS = 10_000;

export type RecorderConnectionCore = ReturnType<
  typeof createRecorderConnectionCore
>;

export function createRecorderConnectionCore(deps: RecorderConnectionDeps) {
  /**
   * Whether the recorder is worth following — it was recording, or holding a
   * track, the last time this browser looked. Cached from storage because the
   * desired state is resolved often enough that reading it each time would be
   * a syscall per reconcile.
   */
  let followed = deps.readFollowed();

  /**
   * Whether the last attempt to persist the flag failed (storage denied or
   * full). Remembered so the next set retries the write even when the value
   * itself has not changed — otherwise one refused write would leave storage
   * wrong for the rest of the session, and the next page load would not go
   * looking for a ride that is still being recorded.
   */
  let followWriteFailed = false;

  /** The stream, when one is attached. */
  let stream: StreamHandle | null = null;

  /** Headers arrived: the browser considers it open, the toolbar reads live. */
  let streamOpen = false;

  /** The sync in flight, if any; aborting it is how a teardown stops one. */
  let run: {
    quiet: boolean;
    settled: boolean;
    controller: AbortController;
    promise: Promise<void>;
  } | null = null;

  /** Catch-ups downloading right now, for what the toolbar says. */
  let catchingUp = 0;

  /** A sync dispatched whose handler has not claimed it yet. */
  let syncPending = false;

  let syncClaimTimer: ReturnType<typeof setTimeout> | null = null;

  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Which delay the next retry waits. Rewound only by the stream proving
   * itself (its connect status frame) or by the wanted-configuration changing
   * (see `reconcile`) — deliberately not by a sync succeeding, which proves
   * only `/status` and would keep the wait at its first step forever when
   * `/stream` alone is broken.
   */
  let delayIndex = 0;

  /**
   * Whether the most recent sync failed. Giving up — unfollowing — is gated on
   * this, not on the delays running out alone: exhausted delays with syncs
   * still succeeding mean the recorder is reachable and reporting a ride, and
   * a page must not abandon a ride the recorder itself still claims. The
   * cadence just holds at the longest delay until the recorder's own status
   * ends the following.
   */
  let lastSyncFailed = false;

  /**
   * Whether the live view was working before the attempt now under way — it
   * decides whether a failure is worth saying out loud.
   */
  let wasLive = false;

  let lastPublished: GpsRecorderConnection | null = null;

  /** The wanted-configuration the current retry budget belongs to. */
  let lastConfig = configOf();

  function configOf(): string {
    return `${deps.isVisible()}|${followed}|${deps.isToolOpen()}`;
  }

  function wanted(): boolean {
    return deps.isVisible() && (followed || deps.isToolOpen());
  }

  /**
   * What the connection is doing, as one derived answer. `connecting` is an
   * attempt under way; `reconnecting` is the wait before the next one.
   */
  function connectionState(): GpsRecorderConnection {
    if (catchingUp > 0) {
      return 'syncing';
    }

    if (streamOpen) {
      return 'live';
    }

    if (run !== null || syncPending || stream !== null) {
      return 'connecting';
    }

    return retryTimer === null ? 'idle' : 'reconnecting';
  }

  /** Publishes the derived state when it changed; free to call anywhere. */
  function publish(): void {
    const state = connectionState();

    if (state !== lastPublished) {
      lastPublished = state;

      deps.publish(state);
    }
  }

  function cancelRetry(): void {
    if (retryTimer !== null) {
      clearTimeout(retryTimer);

      retryTimer = null;
    }
  }

  function clearSyncPending(): void {
    syncPending = false;

    if (syncClaimTimer !== null) {
      clearTimeout(syncClaimTimer);

      syncClaimTimer = null;
    }
  }

  /** Drops everything: the stream, the sync in flight, the retry, the queue. */
  function teardown(): void {
    cancelRetry();

    delayIndex = 0;

    lastSyncFailed = false;

    clearSyncPending();

    wasLive = false;

    deps.onTeardown();

    run?.controller.abort();

    run = null;

    stream?.close();

    stream = null;

    streamOpen = false;
  }

  /**
   * Brings the connection into line with whether there should be one, and says
   * so. Idempotent, and the only way in: called after anything that could
   * change the answer.
   */
  function reconcile(): void {
    // The retry budget belongs to the configuration that spent it: a user
    // opening the tool, or a page coming back, is a fresh look and deserves
    // the fast delays again rather than inheriting a widened wait from a
    // configuration nobody is in any more.
    const config = configOf();

    if (config !== lastConfig) {
      lastConfig = config;

      delayIndex = 0;
    }

    if (!wanted()) {
      teardown();

      publish();

      return;
    }

    if (
      stream === null &&
      run === null &&
      retryTimer === null &&
      !syncPending
    ) {
      syncPending = true;

      syncClaimTimer = setTimeout(() => {
        clearSyncPending();

        lastSyncFailed = true;

        retry();

        publish();
      }, SYNC_CLAIM_MS);

      // Quiet unless a live view was lost: a recorder that has since been
      // killed must not greet the user with an error they did nothing to
      // provoke, but a ride whose figures have just stopped advancing is news.
      deps.dispatchSync(!wasLive);
    }

    publish();
  }

  /**
   * Schedules the next attempt, or ends the chain.
   *
   * The chain ends — the page stops following — only when the syncs themselves
   * are failing with nobody watching: the recorder is not answering at all,
   * and a page left open for a week must not go on asking every half minute.
   * With the tool open somebody is looking, so it keeps asking at the longest
   * interval; with syncs succeeding the recorder is reachable and still
   * reporting a ride, so likewise.
   */
  function retry(): void {
    // A stream in hand carries the live view whatever a sync beside it did;
    // its own error handler drops it and starts this chain if it breaks.
    if (retryTimer !== null || stream !== null || !wanted()) {
      return;
    }

    const delay = RETRY_DELAYS[delayIndex];

    if (delay === undefined && lastSyncFailed && !deps.isToolOpen()) {
      setFollowed(false);

      return;
    }

    if (delay !== undefined) {
      delayIndex++;
    }

    retryTimer = setTimeout(() => {
      retryTimer = null;

      reconcile();
    }, delay ?? RETRY_DELAYS.at(-1));
  }

  /**
   * Sets the follow flag. Following is an input to the desired state, so a
   * change goes through the reconcile like every other input; an unchanged
   * value only retries a persist that previously failed.
   */
  function setFollowed(value: boolean): void {
    const changed = value !== followed;

    followed = value;

    if (changed || followWriteFailed) {
      followWriteFailed = !deps.writeFollowed(value);
    }

    if (changed) {
      reconcile();
    }
  }

  function attachStream(): void {
    const handle = deps.openStream({
      onOpen: () => {
        if (stream !== handle) {
          return;
        }

        streamOpen = true;

        publish();
      },

      onStatusFrame: () => {
        if (stream !== handle) {
          return;
        }

        // End-to-end proof: the server composed and delivered a frame. Only
        // now is the backoff rewound and the view considered live enough that
        // losing it is worth saying out loud.
        delayIndex = 0;

        wasLive = true;

        publish();
      },

      onError: () => {
        // A stale handle's late error must not touch its replacement.
        if (stream !== handle) {
          return;
        }

        // Any error drops the handle and feeds the backoff — deliberately not
        // left to the browser's own reconnection, which retries a dead
        // loopback forever and never gives up; the retry re-runs the whole
        // sync, whose catch-up notices what changed while the stream was down.
        handle.close();

        stream = null;

        streamOpen = false;

        retry();

        publish();
      },
    });

    stream = handle;
  }

  /**
   * The sync in flight, if any. Concurrent asks coalesce onto it; the weakest
   * `quiet` claim among them wins, so one caller who asked out loud is enough
   * for a failure to be reported out loud.
   *
   * `restart` is for the caller a run already in flight cannot answer — one
   * that needs a status newer than what that run read. It abandons the run
   * (whose loudness the fold above carries over) and asks again.
   *
   * `start` is the sync itself, which lives in the lazily loaded handlers;
   * it reports back through its own `settle`, which is bound to this run —
   * a settle from a run that has been abandoned is ignored, so an abandoned
   * run can never attach a stream or arm a retry on the module's behalf.
   */
  function runSync(
    { quiet, restart = false }: { quiet: boolean; restart?: boolean },
    start: SyncStart,
  ): Promise<void> {
    clearSyncPending();

    if (run) {
      // The weakest claim survives whichever way this goes: a joiner folds
      // into the run, and a restart folds the abandoned run's loudness into
      // its replacement, which is what answers those callers now.
      quiet &&= run.quiet;

      if (!restart) {
        run.quiet = quiet;

        return run.promise;
      }

      run.controller.abort();

      run = null;
    }

    const entry = {
      quiet,
      settled: false,
      controller: new AbortController(),
      promise: Promise.resolve(),
    };

    run = entry;

    const settle = (outcome: SyncOutcome): void => {
      if (entry.settled || run !== entry) {
        return;
      }

      entry.settled = true;

      if (outcome.ok) {
        lastSyncFailed = false;

        cancelRetry();

        if (!wanted()) {
          // The page went away while the sync was finishing; attaching now
          // would only hand out a stream that is frozen from birth.
          teardown();
        } else if (stream === null) {
          attachStream();
        }
      } else {
        lastSyncFailed = true;

        if (outcome.hopeless) {
          // A refusal will not turn into a grant, and an old APK will not
          // update itself, by asking again.
          cancelRetry();
        } else {
          retry();
        }
      }

      publish();
    };

    entry.promise = start(
      entry.controller.signal,
      () => entry.quiet,
      settle,
    ).finally(() => {
      if (run === entry) {
        run = null;
      }

      publish();
    });

    publish();

    return entry.promise;
  }

  /**
   * Runs a catch-up, with the connection reading `syncing` for as long as it
   * takes. Bracketed rather than announced, so no early return can leave the
   * toolbar spinning on a wait that finished.
   */
  async function whileCatchingUp<T>(fetch: () => Promise<T>): Promise<T> {
    catchingUp++;

    publish();

    try {
      return await fetch();
    } finally {
      catchingUp--;

      publish();
    }
  }

  return {
    reconcile,
    setFollowed,
    runSync,
    whileCatchingUp,
    isFollowed: () => followed,
  };
}
