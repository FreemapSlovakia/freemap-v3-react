export type Work = () => [payload: unknown, transferable: Transferable[]];

export type WorkerPool = {
  addJob: <T>(work: Work) => Promise<T>;
  destroy: () => void;
};

/**
 * The worker could not be had at all — it failed to start, its script failed to
 * load or parse, or the pool was destroyed under the job. Distinct from a job
 * that ran and threw, because only this one says the work is worth attempting
 * some other way; a caller retrying bad data in the page would only pay for the
 * same failure twice.
 */
export class WorkerUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);

    this.name = 'WorkerUnavailableError';
  }
}

/** Where the platform will not say how many cores there are. */
const DEFAULT_CONCURRENCY = 4;

export function createWorkerPool(workerFactory: () => Worker): WorkerPool {
  const idle: Worker[] = [];

  // Every worker made, not only the idle ones: a busy worker is popped out of
  // `idle`, so terminating that list alone would leave whatever is running to
  // run on after `destroy`.
  const allWorkers = new Set<Worker>();

  let workerCount = 0;

  // `hardwareConcurrency` is absent on some platforms, and `Math.min` with
  // `undefined` is `NaN` — which nothing is below, so no worker would ever be
  // created and every job would wait for one for ever.
  const maxWorkers = Math.min(
    16,
    window.navigator.hardwareConcurrency || DEFAULT_CONCURRENCY,
  );

  let id = 0;

  /** A destroyed pool takes no more work; it has no workers to do it with. */
  let destroyed = false;

  type Job = {
    id: number;
    reject: (error: unknown) => void;
    resolve: (result: unknown) => void;
    run: (worker: Worker) => void;
    started?: true;
    /** Which worker is running it, so a failing worker fails only its own. */
    worker?: Worker;
  };

  const jobMap = new Map<number, Job>();

  function settle(job: Job, reject: unknown, isError: boolean): void {
    jobMap.delete(job.id);

    if (isError) {
      job.reject(reject);
    } else {
      job.resolve(reject);
    }
  }

  /**
   * Fails the jobs one worker was running. **Not** every job: a pool may have
   * sixteen workers going, and one of them losing its script says nothing about
   * the fifteen that are answering — failing those too would take a whole
   * layer's tiles down over one bad chunk.
   */
  function failJobsOn(worker: Worker, reason: unknown): void {
    for (const job of [...jobMap.values()]) {
      if (job.worker === worker) {
        settle(job, reason, true);
      }
    }
  }

  function failAll(reason: unknown): void {
    for (const job of [...jobMap.values()]) {
      settle(job, reason, true);
    }
  }

  function retire(w: Worker): void {
    w.terminate();

    allWorkers.delete(w);

    workerCount--;

    const at = idle.indexOf(w);

    if (at >= 0) {
      idle.splice(at, 1);
    }
  }

  /**
   * Starts what can be started. Loops only over failures — a job that starts
   * hands the loop back, and its completion drives the next — so a permanent
   * failure drains the queue instead of leaving the jobs behind it unanswered.
   */
  function runNextJob(): void {
    while (!destroyed) {
      const job = [...jobMap.values()].find((v) => !v.started);

      if (!job) {
        return;
      }

      let w = idle.pop();

      if (!w) {
        if (workerCount >= maxWorkers) {
          return;
        }

        workerCount++;

        try {
          w = createWorker();
        } catch (err) {
          // A refused `new Worker` — a CSP without `worker-src`, a blocked
          // scheme — is permanent, so the job is answered rather than left
          // waiting for a worker that will never exist.
          workerCount--;

          settle(
            job,
            new WorkerUnavailableError('worker could not be started', {
              cause: err,
            }),
            true,
          );

          continue;
        }
      }

      // Marked before it runs; a worker joins `idle` only once its job
      // completes (see onmessage), so it is never listed as idle while busy —
      // which would double-book jobs onto it and starve the fan-out.
      job.started = true;

      job.worker = w;

      try {
        job.run(w);
      } catch (err) {
        // `work()` threw while making the payload. The worker never heard of
        // it, so it goes back to the pool and only this job is answered.
        job.worker = undefined;

        idle.push(w);

        settle(
          job,
          new WorkerUnavailableError('worker job could not be started', {
            cause: err,
          }),
          true,
        );

        continue;
      }

      return;
    }
  }

  function createWorker(): Worker {
    const w = workerFactory();

    allWorkers.add(w);

    w.onmessage = (evt) => {
      const job = jobMap.get(evt.data.id);

      if (job) {
        settle(
          job,
          evt.data.error ? evt.data.error : evt.data.payload,
          Boolean(evt.data.error),
        );
      } else {
        console.error('no such job', evt.data.id);
      }

      idle.push(w);

      try {
        runNextJob();
      } catch (err) {
        console.error(err);
      }
    };

    // The worker's script failed to load or parse — a stale chunk after a
    // deploy, a syntax error in the bundle. Nothing will answer what it was
    // given, and a caller awaiting one would wait for ever, so its jobs are
    // rejected and the worker is given up on rather than handed more work.
    w.onerror = (err) => {
      console.error('worker error', err);

      retire(w);

      failJobsOn(
        w,
        new WorkerUnavailableError('worker failed', { cause: err.message }),
      );

      // Whatever is left may still be runnable on another worker, or may fail
      // the same way — either answer is better than waiting.
      try {
        runNextJob();
      } catch (runErr) {
        console.error(runErr);
      }
    };

    w.onmessageerror = (err) => {
      console.error('worker message error', err);
    };

    return w;
  }

  function addJob<T>(work: Work): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (destroyed) {
        reject(new WorkerUnavailableError('worker pool destroyed'));

        return;
      }

      const myId = id++;

      jobMap.set(myId, {
        id: myId,
        resolve: resolve as () => T,
        reject,
        run(w) {
          const [payload, transferable] = work();

          w.postMessage({ id: myId, payload }, transferable);
        },
      });

      try {
        runNextJob();
      } catch (err) {
        // `runNextJob` answers the job it could not start, so reaching here
        // means something else went wrong entirely; this job is still owed an
        // answer if it is the one left behind.
        const mine = jobMap.get(myId);

        if (mine) {
          settle(
            mine,
            new WorkerUnavailableError('worker job could not be started', {
              cause: err,
            }),
            true,
          );
        }
      }
    });
  }

  /**
   * Terminates every worker, busy ones included, and answers what was owed.
   * The pool stays destroyed: a caller that is tearing down may still have a
   * request in flight, and reviving the pool for it would spawn workers nothing
   * is left to terminate.
   */
  function destroy() {
    destroyed = true;

    idle.length = 0;

    for (const w of allWorkers) {
      w.terminate();
    }

    allWorkers.clear();

    workerCount = 0;

    failAll(new WorkerUnavailableError('worker pool destroyed'));
  }

  return { addJob, destroy };
}
