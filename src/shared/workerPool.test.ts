import { describe, expect, it, vi } from 'vitest';
import { createWorkerPool, WorkerUnavailableError } from './workerPool.js';

/** Enough of a `Worker` for the pool: it posts, it answers, it terminates. */
class FakeWorker {
  onmessage: ((evt: { data: unknown }) => void) | null = null;

  onerror: ((err: { message: string }) => void) | null = null;

  onmessageerror: ((err: unknown) => void) | null = null;

  readonly posted: { id: number; payload: unknown }[] = [];

  terminated = false;

  postMessage(data: { id: number; payload: unknown }): void {
    this.posted.push(data);
  }

  terminate(): void {
    this.terminated = true;
  }

  /** Answers the job it was last given, the way a real worker would. */
  answer(payload: unknown): void {
    const last = this.posted.at(-1);

    this.onmessage?.({ data: { id: last?.id, payload } });
  }

  fail(error: string): void {
    const last = this.posted.at(-1);

    this.onmessage?.({ data: { id: last?.id, error } });
  }
}

const work = (payload: unknown) => () =>
  [payload, []] as [unknown, Transferable[]];

describe('createWorkerPool', () => {
  it('resolves a job with what the worker answers', async () => {
    const worker = new FakeWorker();

    const pool = createWorkerPool(() => worker as unknown as Worker);

    const job = pool.addJob<string>(work('in'));

    worker.answer('out');

    await expect(job).resolves.toBe('out');
  });

  it('rejects with the error a job threw, which is not a worker failure', async () => {
    const worker = new FakeWorker();

    const pool = createWorkerPool(() => worker as unknown as Worker);

    const job = pool.addJob(work('in'));

    worker.fail('bad data');

    await expect(job).rejects.toBe('bad data');
  });

  // The three below all used to leave the promise pending for ever, which left
  // whatever awaited it — a panorama render — with no picture and no error.
  it('rejects when the worker cannot be constructed at all', async () => {
    const pool = createWorkerPool(() => {
      throw new Error('blocked by CSP');
    });

    await expect(pool.addJob(work('in'))).rejects.toBeInstanceOf(
      WorkerUnavailableError,
    );
  });

  it('rejects what is outstanding when the worker script fails', async () => {
    const worker = new FakeWorker();

    const pool = createWorkerPool(() => worker as unknown as Worker);

    const job = pool.addJob(work('in'));

    worker.onerror?.({ message: 'chunk 404' });

    await expect(job).rejects.toBeInstanceOf(WorkerUnavailableError);

    expect(worker.terminated).toBe(true);
  });

  it('fails only the jobs the broken worker held, not its siblings', async () => {
    const workers: FakeWorker[] = [];

    const pool = createWorkerPool(() => {
      const w = new FakeWorker();

      workers.push(w);

      return w as unknown as Worker;
    });

    // Two jobs, so two workers: each `addJob` runs the queue itself.
    const doomed = pool.addJob(work('a'));

    const healthy = pool.addJob<string>(work('b'));

    expect(workers).toHaveLength(2);

    workers[0]?.onerror?.({ message: 'chunk 404' });

    await expect(doomed).rejects.toBeInstanceOf(WorkerUnavailableError);

    // One worker losing its script says nothing about the other, and taking a
    // whole layer's tiles down over one bad chunk is what this guards against.
    workers[1]?.answer('b out');

    await expect(healthy).resolves.toBe('b out');
  });

  it('answers a job queued behind one that could not start', async () => {
    const pool = createWorkerPool(() => {
      throw new Error('blocked by CSP');
    });

    const first = pool.addJob(work('a'));

    const second = pool.addJob(work('b'));

    await expect(first).rejects.toBeInstanceOf(WorkerUnavailableError);

    await expect(second).rejects.toBeInstanceOf(WorkerUnavailableError);
  });

  it('stays destroyed rather than spawning workers nothing will terminate', async () => {
    const made: FakeWorker[] = [];

    const pool = createWorkerPool(() => {
      const w = new FakeWorker();

      made.push(w);

      return w as unknown as Worker;
    });

    pool.destroy();

    // A caller past its own teardown check can still get here; it must be
    // answered, not served by a worker the removed layer will never clean up.
    await expect(pool.addJob(work('late'))).rejects.toBeInstanceOf(
      WorkerUnavailableError,
    );

    expect(made).toHaveLength(0);
  });

  it('terminates a busy worker on destroy, and answers what it owed', async () => {
    const worker = new FakeWorker();

    const pool = createWorkerPool(() => worker as unknown as Worker);

    const job = pool.addJob(work('in'));

    // Busy, so it is not in the idle pool — which is exactly the worker a
    // destroy used to leave running.
    pool.destroy();

    expect(worker.terminated).toBe(true);

    await expect(job).rejects.toBeInstanceOf(WorkerUnavailableError);
  });

  it('makes a worker even where the platform reports no concurrency', async () => {
    const spy = vi
      .spyOn(window.navigator, 'hardwareConcurrency', 'get')
      .mockReturnValue(undefined as unknown as number);

    try {
      const worker = new FakeWorker();

      const pool = createWorkerPool(() => worker as unknown as Worker);

      const job = pool.addJob<string>(work('in'));

      // `Math.min(16, undefined)` is NaN, and nothing is ever below NaN — so
      // without a floor no worker is made and the job waits for ever.
      expect(worker.posted).toHaveLength(1);

      worker.answer('out');

      await expect(job).resolves.toBe('out');
    } finally {
      spy.mockRestore();
    }
  });
});
