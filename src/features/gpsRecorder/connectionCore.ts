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
   * The connect status frame arrived — the server composed and delivered
   * something, which headers alone do not prove.
   */
  onStatusFrame(): void;

  /** Any error. The core drops the handle and feeds the backoff. */
  onError(): void;
};

export type RecorderConnectionDeps = {
  isVisible(): boolean;

  isToolOpen(): boolean;

  readFollowed(): boolean;

  writeFollowed(value: boolean): void;

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
      ok: false;
      /** Whether retrying could help: a refused permission or an old APK won't. */
      hopeless: boolean;
      /**
       * Whether this is the recorder failing to answer, which is what giving up
       * is gated on. False for a failure that came after it answered — a track
       * too big for the transfer budget, a body this app could not read — which
       * says nothing about whether a ride is still being recorded.
       */
      recorderFailed: boolean;
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
 * before the ask is written off — a hashed chunk a deploy has moved, or a
 * network that dropped mid-import.
 */
export const SYNC_CLAIM_MS = 10_000;

/**
 * How long a stream must keep running, past the frame that proved it works,
 * before the backoff is rewound. Proof has to be a duration rather than an
 * event: every instant a stream can reach — headers, the first frame — is one
 * a recorder dying immediately afterwards also reaches, and rewinding on any
 * of them lets such a recorder be retried at the shortest delay forever.
 */
export const STREAM_PROVEN_MS = RETRY_DELAYS[RETRY_DELAYS.length - 1];

/**
 * How long a stream may take to report anything before it is written off.
 * Nothing here crosses a network, so this is not slowness but a socket the
 * kernel accepted for a recorder that never got to answer on it — and such a
 * stream reports neither open nor error, so without a deadline the connection
 * would hold a handle nothing can retry behind.
 */
export const STREAM_OPEN_MS = 5000;

export type RecorderConnectionCore = ReturnType<
  typeof createRecorderConnectionCore
>;

type Slot = {
  handle: StreamHandle | null;
  open: boolean;
  dropped: boolean;
};

type Run = {
  quiet: boolean;
  settled: boolean;
  /** How it went, or null for a run that was abandoned before it said. */
  outcome: SyncOutcome | null;
  controller: AbortController;
  promise: Promise<SyncOutcome | null>;
  resolve: (
    value: SyncOutcome | null | PromiseLike<SyncOutcome | null>,
  ) => void;
};

export function createRecorderConnectionCore(deps: RecorderConnectionDeps) {
  /**
   * Whether the recorder is worth following — it was recording, or holding a
   * track, the last time this browser looked. Cached from storage because the
   * desired state is resolved often enough that reading it each time would be
   * a syscall per reconcile.
   */
  let followed = deps.readFollowed();

  /**
   * The stream, when one is attached. The handle and whether it is open live
   * together, so dropping one cannot leave the other behind — a toolbar stuck
   * on `live` with no connection under it.
   */
  let stream: Slot | null = null;

  /** The sync in flight, if any; aborting it is how a teardown stops one. */
  let run: Run | null = null;

  /** Catch-ups downloading right now, for what the toolbar says. */
  let catchingUp = 0;

  /** A sync dispatched whose handler has not claimed it yet. */
  let syncPending = false;

  let syncClaimTimer: ReturnType<typeof setTimeout> | null = null;

  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  let provenTimer: ReturnType<typeof setTimeout> | null = null;

  let openTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Which delay the next retry waits. Rewound by a stream that has proven
   * itself (see {@link STREAM_PROVEN_MS}) or by the wanted-configuration
   * changing — deliberately not by a sync succeeding, which proves only
   * `/status` and would hold the wait at its first step forever when `/stream`
   * alone is broken.
   */
  let delayIndex = 0;

  /**
   * How many times in a row the recorder itself has failed to answer. Giving up
   * — unfollowing — is gated on this rather than on the delays running out:
   * those are spent by anything that drops the connection, a stream that will
   * not stay up while `/status` answers perfectly included, and a page must not
   * abandon a ride over a live view it could not keep. An ask this app never
   * managed to make (a chunk that would not load) is not the recorder failing
   * either, and must never cost the following.
   */
  let recorderFailures = 0;

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

    if (stream?.open) {
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

  function cancelProven(): void {
    if (provenTimer !== null) {
      clearTimeout(provenTimer);

      provenTimer = null;
    }
  }

  function clearSyncPending(): void {
    syncPending = false;

    if (syncClaimTimer !== null) {
      clearTimeout(syncClaimTimer);

      syncClaimTimer = null;
    }
  }

  function cancelOpen(): void {
    if (openTimer !== null) {
      clearTimeout(openTimer);

      openTimer = null;
    }
  }

  function dropStream(): void {
    cancelProven();

    cancelOpen();

    if (stream !== null) {
      stream.dropped = true;

      stream.handle?.close();

      stream = null;
    }
  }

  /** Drops everything: the stream, the sync in flight, the retry, the queue. */
  function teardown(): void {
    cancelRetry();

    delayIndex = 0;

    recorderFailures = 0;

    clearSyncPending();

    wasLive = false;

    deps.onTeardown();

    run?.controller.abort();

    run = null;

    dropStream();
  }

  /**
   * Brings the connection into line with whether there should be one, and says
   * so. Idempotent, and the only way in: called after anything that could
   * change the answer.
   */
  function reconcile(): void {
    // The retry budget belongs to the configuration that spent it: a user
    // opening the tool, or a page coming back, is a fresh look that deserves
    // the fast delays again — and an immediate attempt, rather than waiting
    // out a widened delay armed for a configuration nobody is in any more.
    const config = configOf();

    if (config !== lastConfig) {
      lastConfig = config;

      delayIndex = 0;

      // The whole budget starts over, giving up included: a fresh look is
      // entitled to find out for itself whether the recorder is there.
      recorderFailures = 0;

      cancelRetry();
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

        // Deliberately not counted as a recorder failure: nothing ever reached
        // the recorder, so this says nothing about it. The chain widens and
        // keeps asking, but a chunk that will not load must never unfollow a
        // ride that is still being recorded.
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
   * The chain ends — the page stops following — only when the recorder itself
   * is failing to answer with nobody watching: a page left open for a week
   * must not go on asking every half minute. With the tool open somebody is
   * looking, so it keeps asking at the longest interval; with syncs succeeding
   * the recorder is reachable and still reporting a ride, so likewise.
   */
  function retry(): void {
    // A stream in hand carries the live view whatever a sync beside it did;
    // its own error handler drops it and starts this chain if it breaks.
    if (retryTimer !== null || stream !== null || !wanted()) {
      return;
    }

    const delay = RETRY_DELAYS[delayIndex];

    if (
      delay === undefined &&
      recorderFailures >= RETRY_DELAYS.length &&
      !deps.isToolOpen()
    ) {
      setFollowed(false);

      return;
    }

    if (delay !== undefined) {
      delayIndex++;
    }

    retryTimer = setTimeout(
      () => {
        retryTimer = null;

        reconcile();
      },
      delay ?? RETRY_DELAYS[RETRY_DELAYS.length - 1],
    );
  }

  /**
   * Sets the follow flag. Following is an input to the desired state, so a
   * change goes through the reconcile like every other input. The persist is
   * unconditional, which also repairs a value another tab changed underneath
   * this one.
   */
  function setFollowed(value: boolean): void {
    const changed = value !== followed;

    followed = value;

    deps.writeFollowed(value);

    if (changed) {
      reconcile();
    }
  }

  function attachStream(): void {
    // Installed before the stream is opened, so a transport that reports
    // synchronously — a fake in a test, a polyfill that fails inline — is not
    // answering about a stream the core does not yet believe in.
    const slot: Slot = { handle: null, open: false, dropped: false };

    stream = slot;

    // A stream that says nothing at all is dropped like one that failed: with a
    // handle in hand no retry is armed and no sync is dispatched, so a silent
    // one would park the connection until the page went away.
    openTimer = setTimeout(() => {
      openTimer = null;

      dropStream();

      retry();

      publish();
    }, STREAM_OPEN_MS);

    const handle = deps.openStream({
      onOpen: () => {
        if (stream !== slot) {
          return;
        }

        cancelOpen();

        slot.open = true;

        publish();
      },

      onStatusFrame: () => {
        if (stream !== slot) {
          return;
        }

        cancelOpen();

        // Enough of a live view that losing it is worth saying out loud — but
        // not yet enough to rewind the backoff, which waits for the stream to
        // keep running (a recorder that dies right after its frame would
        // otherwise be retried at the shortest delay forever).
        wasLive = true;

        if (provenTimer === null) {
          provenTimer = setTimeout(() => {
            provenTimer = null;

            delayIndex = 0;
          }, STREAM_PROVEN_MS);
        }

        publish();
      },

      onError: () => {
        // A stale handle's late error must not touch its replacement.
        if (stream !== slot) {
          return;
        }

        // Any error drops the handle and feeds the backoff — deliberately not
        // left to the browser's own reconnection, which retries a dead
        // loopback forever and never gives up; the retry re-runs the whole
        // sync, whose catch-up notices what changed while the stream was down.
        dropStream();

        retry();

        publish();
      },
    });

    slot.handle = handle;

    // Reported dead while it was being opened.
    if (slot.dropped) {
      handle.close();
    }
  }

  /**
   * The sync in flight, if any. Concurrent asks coalesce onto it; the weakest
   * `quiet` claim among them wins, so one caller who asked out loud is enough
   * for a failure to be reported out loud.
   *
   * `restart` is for the caller a run already in flight cannot answer — one
   * that needs a status newer than what that run read. It abandons the run and
   * asks again; the abandoned run's callers are answered by the replacement, in
   * loudness, in when they are told it is done, and in what they are told — so
   * awaiting a sync means the same thing whether or not it was restarted along
   * the way. That last one matters to a caller that acts on the answer: a
   * replacement read its status later than the run it replaced, so it answers
   * the question just as well, and treating a restart as no answer at all would
   * abandon a flow for a reason that was never a failure.
   *
   * The answer is the outcome the run settled on, or null for one that never
   * settled — a teardown, which is the page going away rather than a sync
   * saying anything.
   *
   * `start` is the sync itself, which lives in the lazily loaded handlers; it
   * reports through its own `settle`, which is bound to this run — a settle
   * from a run that has been abandoned is ignored, so an abandoned run can
   * never attach a stream or arm a retry on the module's behalf.
   */
  function runSync(
    opts: { quiet: boolean; restart?: boolean },
    start: SyncStart,
  ): Promise<SyncOutcome | null> {
    clearSyncPending();

    let quiet = opts.quiet;

    let abandoned: Run | null = null;

    if (run) {
      // The weakest claim survives whichever way this goes: a joiner folds
      // into the run, and a restart folds the abandoned run's loudness into
      // its replacement, which is what answers those callers now.
      quiet &&= run.quiet;

      if (!opts.restart) {
        run.quiet = quiet;

        return run.promise;
      }

      abandoned = run;

      run.controller.abort();

      run = null;
    }

    const entry: Run = {
      quiet,
      settled: false,
      outcome: null,
      controller: new AbortController(),
      promise: Promise.resolve(null),
      resolve: () => {},
    };

    entry.promise = new Promise<SyncOutcome | null>((resolve) => {
      entry.resolve = resolve;
    });

    run = entry;

    // Whoever awaited the run this one replaced is waiting for an answer about
    // the recorder, not about a particular request; they get this one's.
    abandoned?.resolve(entry.promise);

    const settle = (outcome: SyncOutcome): void => {
      if (entry.settled || run !== entry) {
        return;
      }

      entry.settled = true;

      entry.outcome = outcome;

      if (outcome.ok) {
        recorderFailures = 0;

        cancelRetry();

        if (!wanted()) {
          // The page went away while the sync was finishing; attaching now
          // would only hand out a stream that is frozen from birth.
          teardown();
        } else if (stream === null) {
          attachStream();
        }
      } else {
        if (outcome.recorderFailed) {
          recorderFailures++;
        } else {
          recorderFailures = 0;
        }

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

    let started: Promise<void>;

    try {
      started = start(entry.controller.signal, () => entry.quiet, settle);
    } catch (err) {
      started = Promise.reject(err);
    }

    started
      .catch(() => {
        // A sync that broke without reporting is still a failed attempt: left
        // unsettled it would arm no retry, and the chain would end silently
        // with nothing that would ever ask again. Not the recorder failing,
        // though — the handler never got as far as reporting about it, so like
        // an ask nothing ever claimed it must not cost the following.
        settle({ ok: false, hopeless: false, recorderFailed: false });
      })
      .finally(() => {
        if (run === entry) {
          run = null;
        }

        // A no-op for a run already answered by the replacement that abandoned
        // it; what is left is the outcome of a run that answered for itself, or
        // null for one that never got to.
        entry.resolve(entry.outcome);

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

  return { reconcile, setFollowed, runSync, whileCatchingUp };
}
