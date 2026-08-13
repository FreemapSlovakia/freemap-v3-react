import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRecorderConnectionCore,
  RETRY_DELAYS,
  type RecorderConnectionCore,
  STREAM_OPEN_MS,
  STREAM_PROVEN_MS,
  type StreamCallbacks,
  SYNC_CLAIM_MS,
  type SyncOutcome,
} from './connectionCore.js';

/**
 * Drives the decision core with fake deps and a fake clock. Each test acts as
 * the sync handler too: a dispatched sync only runs when the test claims it
 * with `beginRun`, mirroring the lazily loaded handler in production.
 */
function makeHarness({
  followed = false,
  visible = true,
  toolOpen = false,
}: {
  followed?: boolean;
  visible?: boolean;
  toolOpen?: boolean;
} = {}) {
  const h = {
    visible,
    toolOpen,
    stored: followed,
    writes: [] as boolean[],
    published: [] as string[],
    syncs: [] as boolean[],
    streams: [] as { callbacks: StreamCallbacks; closed: boolean }[],
    teardowns: 0,
    /** Makes the next `openStream` report an error before it returns. */
    failStreamSynchronously: false,
    core: null as unknown as RecorderConnectionCore,
  };

  h.core = createRecorderConnectionCore({
    isVisible: () => h.visible,
    isToolOpen: () => h.toolOpen,
    readFollowed: () => h.stored,
    writeFollowed: (value) => {
      h.writes.push(value);

      h.stored = value;
    },
    openStream: (callbacks) => {
      const stream = { callbacks, closed: false };

      h.streams.push(stream);

      if (h.failStreamSynchronously) {
        h.failStreamSynchronously = false;

        callbacks.onError();
      }

      return {
        close: () => {
          stream.closed = true;
        },
      };
    },
    dispatchSync: (quiet) => {
      h.syncs.push(quiet);
    },
    publish: (state) => {
      h.published.push(state);
    },
    onTeardown: () => {
      h.teardowns++;
    },
  });

  return h;
}

type Harness = ReturnType<typeof makeHarness>;

type Run = {
  signal: AbortSignal;
  isQuiet: () => boolean;
  settle: (outcome: SyncOutcome) => void;
  finish: () => void;
  fail: (err: unknown) => void;
  promise: Promise<SyncOutcome | null>;
};

/** Claims a dispatched sync, handing the test the run's controls. */
function beginRun(
  h: Harness,
  opts: { quiet: boolean; restart?: boolean } = { quiet: true },
): Run {
  const run = {} as Run;

  run.promise = h.core.runSync(opts, (signal, isQuiet, settle) => {
    run.signal = signal;

    run.isQuiet = isQuiet;

    run.settle = settle;

    return new Promise<void>((resolve, reject) => {
      run.finish = resolve;

      run.fail = reject;
    });
  });

  return run;
}

async function completeOk(run: Run) {
  run.settle({ ok: true });

  run.finish();

  await run.promise;
}

async function completeFail(
  run: Run,
  { hopeless = false, recorderFailed = true } = {},
) {
  run.settle({ ok: false, hopeless, recorderFailed });

  run.finish();

  await run.promise;
}

/** One sync-fails cycle: claim the pending ask, fail it. */
async function failPendingSync(
  h: Harness,
  opts?: { recorderFailed?: boolean },
) {
  await completeFail(beginRun(h), opts);
}

/** One cycle where the sync works but the stream never proves itself. */
async function okSyncBrokenStream(h: Harness, { frame = false } = {}) {
  await completeOk(beginRun(h));

  const stream = openStream(h);

  stream.callbacks.onOpen();

  if (frame) {
    stream.callbacks.onStatusFrame();
  }

  stream.callbacks.onError();
}

const last = (h: Harness) => h.published.at(-1);

const openStream = (h: Harness) => h.streams.at(-1)!;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('wanting a connection', () => {
  it('follows the flag: reconcile syncs, success attaches, the stream goes live', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    expect(h.syncs).toEqual([true]); // quiet: no live view was lost

    expect(last(h)).toBe('connecting');

    await completeOk(beginRun(h));

    expect(h.streams).toHaveLength(1);

    openStream(h).callbacks.onOpen();

    expect(last(h)).toBe('live');
  });

  it('stays idle when neither followed nor open', () => {
    const h = makeHarness();

    h.core.reconcile();

    expect(h.syncs).toEqual([]);

    expect(last(h)).toBe('idle');
  });

  it('hidden tears down: stream closed, run aborted; visible starts over', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    const run = beginRun(h);

    h.visible = false;

    h.core.reconcile();

    expect(run.signal.aborted).toBe(true);

    expect(last(h)).toBe('idle');

    run.finish();

    await run.promise;

    h.visible = true;

    h.core.reconcile();

    expect(h.syncs).toHaveLength(2);
  });

  it('dropping the follow flag closes a live stream', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeOk(beginRun(h));

    openStream(h).callbacks.onOpen();

    h.core.setFollowed(false);

    expect(openStream(h).closed).toBe(true);

    expect(last(h)).toBe('idle');

    expect(h.stored).toBe(false);
  });
});

describe('the backoff', () => {
  it('widens over failed syncs and gives up only with nobody watching', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    for (const delay of RETRY_DELAYS) {
      await failPendingSync(h);

      expect(last(h)).toBe('reconnecting');

      const before = h.syncs.length;

      vi.advanceTimersByTime(delay - 1);

      expect(h.syncs).toHaveLength(before); // the wait is the whole delay

      vi.advanceTimersByTime(1);

      expect(h.syncs).toHaveLength(before + 1);
    }

    // The sixth failure exhausts the delays: unfollow and stop.
    await failPendingSync(h);

    expect(h.stored).toBe(false);

    expect(last(h)).toBe('idle');

    vi.advanceTimersByTime(120_000);

    expect(h.syncs).toHaveLength(RETRY_DELAYS.length + 1);
  });

  it('never gives up while the syncs succeed, however broken the stream', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    for (let i = 0; i < 10; i++) {
      await okSyncBrokenStream(h);

      vi.advanceTimersByTime(30_000);
    }

    expect(h.stored).toBe(true); // still following: the recorder answers

    // And the cadence held at the longest delay rather than looping fast.
    const before = h.syncs.length;

    await okSyncBrokenStream(h);

    vi.advanceTimersByTime(29_999);

    expect(h.syncs).toHaveLength(before);

    vi.advanceTimersByTime(1);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a sync succeeding does not rewind the wait', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await okSyncBrokenStream(h);

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    await okSyncBrokenStream(h);

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[1] - 1);

    expect(h.syncs).toHaveLength(before); // widened despite the good syncs

    vi.advanceTimersByTime(1);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a stream that dies right after its frame still widens', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    // Headers and the connect frame, then gone — every cycle.
    await okSyncBrokenStream(h, { frame: true });

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    await okSyncBrokenStream(h, { frame: true });

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[1] - 1);

    expect(h.syncs).toHaveLength(before); // not pinned at the first delay

    vi.advanceTimersByTime(1);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a stream that keeps running rewinds the wait', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await okSyncBrokenStream(h);

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    // This one delivers its frame and survives long enough to prove itself.
    await completeOk(beginRun(h));

    openStream(h).callbacks.onOpen();

    openStream(h).callbacks.onStatusFrame();

    expect(last(h)).toBe('live');

    vi.advanceTimersByTime(STREAM_PROVEN_MS);

    openStream(h).callbacks.onError();

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 1); // back to the first delay
  });

  it('a changed configuration re-baselines the budget and looks at once', async () => {
    const h = makeHarness({ followed: true, toolOpen: true });

    h.core.reconcile();

    for (const delay of RETRY_DELAYS) {
      await failPendingSync(h);

      vi.advanceTimersByTime(delay);
    }

    await failPendingSync(h);

    expect(h.stored).toBe(true); // somebody is watching

    expect(last(h)).toBe('reconnecting'); // parked at the longest wait

    // Closing the tool is a fresh look: it does not wait out the inherited 30 s.
    const before = h.syncs.length;

    h.toolOpen = false;

    h.core.reconcile();

    expect(h.syncs).toHaveLength(before + 1);

    // And the budget starts over rather than giving up on the next failure.
    await failPendingSync(h);

    expect(h.stored).toBe(true);

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 2);
  });

  it('a stream that spends the ladder does not spend the giving-up', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    // A recorder that answers `/status` but cannot keep a stream up: every
    // cycle spends a rung, and the ladder is soon gone.
    for (let i = 0; i < RETRY_DELAYS.length + 2; i++) {
      await okSyncBrokenStream(h);

      vi.advanceTimersByTime(RETRY_DELAYS[RETRY_DELAYS.length - 1]);
    }

    // One `/status` that timed out must not end a ride on its own, whatever the
    // stream has spent — giving up is about the recorder, not the live view.
    await failPendingSync(h);

    expect(h.stored).toBe(true);

    expect(last(h)).toBe('reconnecting');

    // It takes as many recorder failures as it would have from the start.
    for (let i = 0; i < RETRY_DELAYS.length; i++) {
      vi.advanceTimersByTime(RETRY_DELAYS[RETRY_DELAYS.length - 1]);

      await failPendingSync(h);
    }

    expect(h.stored).toBe(false);
  });

  it('never gives up on failures the recorder answered', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    // A page this app could not read fails the same way every time: the
    // recorder is there and reporting a ride, so the delays running out must
    // not end it, however many times it happens.
    for (const delay of RETRY_DELAYS) {
      await failPendingSync(h, { recorderFailed: false });

      vi.advanceTimersByTime(delay);
    }

    await failPendingSync(h, { recorderFailed: false });

    expect(h.stored).toBe(true);

    expect(last(h)).toBe('reconnecting'); // parked at the longest wait

    // Once the recorder itself stops answering, the chain does end — after a
    // run of its own failures, none of which the answered ones paid for.
    for (let i = 0; i < RETRY_DELAYS.length; i++) {
      expect(h.stored).toBe(true);

      vi.advanceTimersByTime(RETRY_DELAYS[RETRY_DELAYS.length - 1]);

      await failPendingSync(h);
    }

    expect(h.stored).toBe(false);

    expect(last(h)).toBe('idle');
  });

  it('a hopeless failure arms no retry', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeFail(beginRun(h), { hopeless: true });

    expect(last(h)).toBe('idle');

    vi.advanceTimersByTime(120_000);

    expect(h.syncs).toHaveLength(1);
  });

  it('a sync nothing claims retries but never unfollows', () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    expect(last(h)).toBe('connecting');

    // Enough unclaimed rounds to exhaust the delays several times over: an
    // app-side failure must not cost a ride that is still being recorded.
    for (let i = 0; i < RETRY_DELAYS.length + 3; i++) {
      vi.advanceTimersByTime(SYNC_CLAIM_MS);

      expect(last(h)).toBe('reconnecting');

      vi.advanceTimersByTime(RETRY_DELAYS[RETRY_DELAYS.length - 1]);
    }

    expect(h.stored).toBe(true);

    expect(h.syncs.length).toBeGreaterThan(RETRY_DELAYS.length);
  });
});

describe('the stream deadline', () => {
  it('a stream that reports nothing is dropped and retried', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeOk(beginRun(h));

    expect(last(h)).toBe('connecting');

    vi.advanceTimersByTime(STREAM_OPEN_MS - 1);

    expect(openStream(h).closed).toBe(false);

    expect(last(h)).toBe('connecting'); // the wait is the whole deadline

    vi.advanceTimersByTime(1);

    expect(openStream(h).closed).toBe(true);

    expect(last(h)).toBe('reconnecting');

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a stream that opened is left to run', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeOk(beginRun(h));

    openStream(h).callbacks.onOpen();

    vi.advanceTimersByTime(STREAM_OPEN_MS * 10);

    expect(openStream(h).closed).toBe(false);

    expect(last(h)).toBe('live');
  });

  it('a silent stream never unfollows: the recorder is answering', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    for (let i = 0; i < RETRY_DELAYS.length + 3; i++) {
      await completeOk(beginRun(h));

      vi.advanceTimersByTime(STREAM_OPEN_MS);

      expect(last(h)).toBe('reconnecting');

      vi.advanceTimersByTime(RETRY_DELAYS[RETRY_DELAYS.length - 1]);
    }

    expect(h.stored).toBe(true);
  });
});

describe('runs', () => {
  it('joins fold loudness into the run', async () => {
    const h = makeHarness({ followed: true });

    const run = beginRun(h, { quiet: true });

    expect(run.isQuiet()).toBe(true);

    const joined = h.core.runSync({ quiet: false }, async () => {
      throw new Error('a join must not start a second run');
    });

    expect(run.isQuiet()).toBe(false);

    await completeOk(run);

    await joined;
  });

  it('restarts abort the run and inherit its loudness', async () => {
    const h = makeHarness({ followed: true });

    const loud = beginRun(h, { quiet: false });

    const restarted = beginRun(h, { quiet: true, restart: true });

    expect(loud.signal.aborted).toBe(true);

    expect(restarted.isQuiet()).toBe(false);

    loud.finish();

    await completeOk(restarted);
  });

  it('a restarted run answers its caller only when the replacement is done', async () => {
    const h = makeHarness({ followed: true });

    const first = beginRun(h, { quiet: false });

    let firstDone = false;

    const awaited = first.promise.then(() => {
      firstDone = true;
    });

    const second = beginRun(h, { quiet: true, restart: true });

    first.finish();

    await Promise.resolve();

    await Promise.resolve();

    expect(firstDone).toBe(false); // the answer is the replacement's

    await completeOk(second);

    await awaited;

    expect(firstDone).toBe(true);
  });

  it('a restarted run is told how the replacement went, not that it was cut off', async () => {
    const h = makeHarness({ followed: true });

    const first = beginRun(h, { quiet: false });

    const second = beginRun(h, { quiet: true, restart: true });

    first.finish();

    await completeOk(second);

    // The caller asked about the recorder, and the replacement read a newer
    // status than the run it replaced — so it answers for both. A flow that
    // acts on the answer (taking a ride off the recorder) must not read a
    // restart as a failure.
    expect(await first.promise).toEqual({ ok: true });
  });

  it('a run nothing settled answers with no outcome at all', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    const run = beginRun(h);

    // A teardown: the page went away mid-sync, which is not the sync saying
    // anything about the recorder.
    h.visible = false;

    h.core.reconcile();

    run.finish();

    expect(await run.promise).toBeNull();
  });

  it('an abandoned run cannot settle on the connection', async () => {
    const h = makeHarness({ followed: true });

    const abandoned = beginRun(h, { quiet: true });

    const owner = beginRun(h, { quiet: true, restart: true });

    abandoned.settle({ ok: true });

    expect(h.streams).toHaveLength(0); // ignored: no stream attached

    abandoned.finish();

    await completeOk(owner);

    expect(h.streams).toHaveLength(1);
  });

  it('a sync that breaks without settling still feeds the backoff', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    const run = beginRun(h);

    run.fail(new Error('the handler threw'));

    await run.promise;

    expect(last(h)).toBe('reconnecting');

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a start that throws on the spot leaves no run behind', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await h.core.runSync({ quiet: true }, () => {
      throw new Error('thrown before any promise');
    });

    expect(last(h)).toBe('reconnecting');

    // The jammed-run failure: a leftover `run` would block every later sync.
    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    const run = beginRun(h);

    await completeOk(run);

    expect(h.streams).toHaveLength(1);
  });

  it('a catch-up brackets as syncing however it returns', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    const run = beginRun(h);

    const failing = h.core
      .whileCatchingUp(() => Promise.reject(new Error('gone')))
      .catch(() => {});

    expect(last(h)).toBe('syncing');

    await failing;

    expect(last(h)).toBe('connecting');

    await completeOk(run);
  });
});

describe('the stream handle', () => {
  it('an error raised while opening leaves nothing attached', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    h.failStreamSynchronously = true;

    await completeOk(beginRun(h));

    expect(openStream(h).closed).toBe(true);

    expect(last(h)).toBe('reconnecting');

    // Not stuck on a dead handle: the chain carries on.
    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a stale handle cannot speak for its replacement', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeOk(beginRun(h));

    const stale = openStream(h);

    stale.callbacks.onError(); // drops it, arms the retry

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    await completeOk(beginRun(h));

    const fresh = openStream(h);

    fresh.callbacks.onOpen();

    expect(last(h)).toBe('live');

    stale.callbacks.onError(); // a late error from the dead one

    expect(last(h)).toBe('live');

    expect(fresh.closed).toBe(false);
  });
});

describe('the follow flag', () => {
  it('persists every set, so another tab cannot leave it wrong', () => {
    const h = makeHarness();

    h.core.setFollowed(true);

    h.stored = false; // another tab cleared it

    h.core.setFollowed(true);

    expect(h.writes).toEqual([true, true]);

    expect(h.stored).toBe(true);
  });

  it('an unchanged value does not reconcile', () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    const before = h.syncs.length;

    h.core.setFollowed(true);

    expect(h.syncs).toHaveLength(before);
  });
});

describe('publishing', () => {
  it('never repeats a state', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await failPendingSync(h);

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    await completeOk(beginRun(h));

    openStream(h).callbacks.onOpen();

    openStream(h).callbacks.onStatusFrame();

    openStream(h).callbacks.onError();

    for (let i = 1; i < h.published.length; i++) {
      expect(h.published[i]).not.toBe(h.published[i - 1]);
    }
  });
});
