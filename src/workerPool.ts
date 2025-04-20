export type Work = () => [payload: unknown, transferable: Transferable[]];

export type WorkerPool = {
  addJob: <T>(work: Work) => Promise<T>;
};

export function createWorkerPool(workerFactory: () => Worker): WorkerPool {
  const workerPool: Worker[] = [];

  let id = 0;

  function runNextJob() {
    const job = [...jobMap.values()].find((v) => !v.started);

    if (job) {
      const w = workerPool.pop();

      if (w) {
        job.started = true;

        job.run(w);
      } else if (
        workerPool.length < Math.min(window.navigator.hardwareConcurrency, 8)
      ) {
        const w = createWorker();

        workerPool.push(w);

        job.started = true;

        job.run(w);
      }
    }
  }

  const jobMap = new Map<
    number,
    {
      reject: (error: unknown) => void;
      resolve: (result: unknown) => void;
      run: (worker: Worker) => void;
      started?: true;
    }
  >();

  function createWorker() {
    const w = workerFactory();

    w.onmessage = (evt) => {
      // console.log('OK', evt.data.id, resMap.has(evt.data.id));

      const job = jobMap.get(evt.data.id);

      if (job) {
        if (evt.data.error) {
          job.reject(evt.data.error);
        } else {
          job.resolve(evt.data.payload);
        }

        jobMap.delete(evt.data.id);
      } else {
        console.error('no such job', evt.data.id);
      }

      workerPool.push(w);

      try {
        runNextJob();
      } catch (err) {
        console.error(err);
      }
    };

    w.onerror = (err) => {
      console.error('worker error');

      console.error(err);
    };

    w.onmessageerror = (err) => {
      console.error('worker message error');

      console.error(err);
    };

    return w;
  }

  function addJob<T>(work: Work): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const myId = id++;

      jobMap.set(myId, {
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
        console.error(err);
      }
    });
  }

  return { addJob };
}
