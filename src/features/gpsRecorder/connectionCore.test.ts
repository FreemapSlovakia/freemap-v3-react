import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRecorderConnectionCore,
  RETRY_DELAYS,
  type RecorderConnectionCore,
  type StreamCallbacks,
  SYNC_CLAIM_MS,
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
    writeOk: true,
    writeAttempts: [] as boolean[],
    published: [] as string[],
    syncs: [] as boolean[],
    streams: [] as { callbacks: StreamCallbacks; closed: boolean }[],
    teardowns: 0,
    core: null as unknown as RecorderConnectionCore,
  };

  h.core = createRecorderConnectionCore({
    isVisible: () => h.visible,
    isToolOpen: () => h.toolOpen,
    readFollowed: () => h.stored,
    writeFollowed: (value) => {
      h.writeAttempts.push(value);

      if (h.writeOk) {
        h.stored = value;
      }

      return h.writeOk;
    },
    openStream: (callbacks) => {
      const stream = { callbacks, closed: false };

      h.streams.push(stream);

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

/** Claims a dispatched sync, handing the test the run's controls. */
function beginRun(
  h: Harness,
  opts: { quiet: boolean; restart?: boolean } = { quiet: true },
) {
  const run = {} as {
    signal: AbortSignal;
    isQuiet: () => boolean;
    settle: (outcome: { ok: true } | { ok: false; hopeless: boolean }) => void;
    finish: () => void;
    promise: Promise<void>;
  };

  run.promise = h.core.runSync(opts, (signal, isQuiet, settle) => {
    run.signal = signal;

    run.isQuiet = isQuiet;

    run.settle = settle;

    return new Promise<void>((resolve) => {
      run.finish = resolve;
    });
  });

  return run;
}

async function completeOk(run: ReturnType<typeof beginRun>) {
  run.settle({ ok: true });

  run.finish();

  await run.promise;
}

async function completeFail(
  run: ReturnType<typeof beginRun>,
  hopeless = false,
) {
  run.settle({ ok: false, hopeless });

  run.finish();

  await run.promise;
}

/** One sync-fails cycle: claim the pending ask, fail it. */
async function failPendingSync(h: Harness) {
  const before = h.syncs.length;

  await completeFail(beginRun(h));

  return before;
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
  it('follows the flag: reconcile syncs, success attaches, the frame goes live', async () => {
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

      vi.advanceTimersByTime(delay - 1);

      expect(h.syncs).toHaveLength(h.syncs.length); // still waiting

      const before = h.syncs.length;

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

    // Sync OK, stream errors before its frame — over and over.
    for (let i = 0; i < 10; i++) {
      await completeOk(beginRun(h));

      openStream(h).callbacks.onError();

      vi.advanceTimersByTime(30_000);
    }

    expect(h.stored).toBe(true); // still following: the recorder answers

    // And the cadence held at the longest delay rather than looping fast.
    const before = h.syncs.length;

    await completeOk(beginRun(h));

    openStream(h).callbacks.onError();

    vi.advanceTimersByTime(29_999);

    expect(h.syncs).toHaveLength(before);

    vi.advanceTimersByTime(1);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a sync succeeding does not rewind the wait; the stream frame does', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    // Two broken-stream cycles: waits should widen 1 s, then 2 s.
    await completeOk(beginRun(h));

    openStream(h).callbacks.onError();

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    await completeOk(beginRun(h));

    openStream(h).callbacks.onError();

    vi.advanceTimersByTime(RETRY_DELAYS[1] - 1);

    expect(last(h)).toBe('reconnecting'); // still the widened wait

    vi.advanceTimersByTime(1);

    // Now a cycle where the stream delivers its frame: proof end to end.
    await completeOk(beginRun(h));

    openStream(h).callbacks.onOpen();

    openStream(h).callbacks.onStatusFrame();

    expect(last(h)).toBe('live');

    // The next drop starts over at the first delay.
    openStream(h).callbacks.onError();

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('headers alone do not rewind: accept-then-drop still widens to give-up', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    for (const delay of RETRY_DELAYS) {
      await completeOk(beginRun(h));

      openStream(h).callbacks.onOpen(); // headers, but never a frame

      openStream(h).callbacks.onError();

      vi.advanceTimersByTime(delay);
    }

    // Exhausted — but the syncs succeed, so it holds at 30 s instead of
    // unfollowing a recorder that answers.
    expect(h.stored).toBe(true);

    expect(last(h)).toBe('connecting'); // the sync the last wait dispatched
  });

  it('failures then one success then a stream blip does not unfollow', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    for (const delay of RETRY_DELAYS.slice(0, 4)) {
      await failPendingSync(h);

      vi.advanceTimersByTime(delay);
    }

    // The recorder is back: sync succeeds, stream blips once before opening.
    await completeOk(beginRun(h));

    openStream(h).callbacks.onError();

    expect(h.stored).toBe(true); // one blip after a success is not the end

    vi.advanceTimersByTime(30_000);

    await completeOk(beginRun(h));

    openStream(h).callbacks.onOpen();

    openStream(h).callbacks.onStatusFrame();

    expect(last(h)).toBe('live');
  });

  it('a changed configuration re-baselines the budget', async () => {
    const h = makeHarness({ followed: true, toolOpen: true });

    h.core.reconcile();

    // Exhaust the delays with the tool open: parked, never giving up.
    for (const delay of RETRY_DELAYS) {
      await failPendingSync(h);

      vi.advanceTimersByTime(delay);
    }

    await failPendingSync(h);

    expect(h.stored).toBe(true); // somebody is watching

    expect(last(h)).toBe('reconnecting'); // parked at the longest wait

    // Closing the tool is a fresh look: the pending wait still runs out, but
    // the next chain starts at the first delay, and gets the whole budget
    // before giving up.
    h.toolOpen = false;

    h.core.reconcile();

    vi.advanceTimersByTime(30_000);

    await failPendingSync(h);

    expect(h.stored).toBe(true);

    const before = h.syncs.length;

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(before + 1);
  });

  it('a hopeless failure arms no retry', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeFail(beginRun(h), true);

    expect(last(h)).toBe('idle');

    vi.advanceTimersByTime(120_000);

    expect(h.syncs).toHaveLength(1);
  });

  it('a sync nothing claims is written off as a failed attempt', () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    expect(last(h)).toBe('connecting');

    vi.advanceTimersByTime(SYNC_CLAIM_MS);

    expect(last(h)).toBe('reconnecting');

    vi.advanceTimersByTime(RETRY_DELAYS[0]);

    expect(h.syncs).toHaveLength(2);
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

  it('an abandoned run cannot settle on the connection', async () => {
    const h = makeHarness({ followed: true });

    const abandoned = beginRun(h, { quiet: true });

    const owner = beginRun(h, { quiet: true, restart: true });

    abandoned.settle({ ok: true });

    expect(h.streams).toHaveLength(0); // ignored: no stream attached

    abandoned.finish();

    await abandoned.promise;

    await completeOk(owner);

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

describe('the follow flag', () => {
  it('retries a persist that failed, even for an unchanged value', () => {
    const h = makeHarness();

    h.writeOk = false;

    h.core.setFollowed(true);

    expect(h.writeAttempts).toEqual([true]);

    expect(h.stored).toBe(false); // the write was refused

    h.writeOk = true;

    h.core.setFollowed(true); // unchanged, but the persist is owed

    expect(h.writeAttempts).toEqual([true, true]);

    expect(h.stored).toBe(true);
  });

  it('an unchanged, persisted value does nothing', () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    const syncsBefore = h.syncs.length;

    h.core.setFollowed(true);

    expect(h.writeAttempts).toEqual([]);

    expect(h.syncs).toHaveLength(syncsBefore);
  });
});

describe('publishing', () => {
  it('never repeats a state', async () => {
    const h = makeHarness({ followed: true });

    h.core.reconcile();

    await completeFail(beginRun(h));

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
