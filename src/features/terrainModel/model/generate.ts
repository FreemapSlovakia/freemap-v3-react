import { WorkerUnavailableError } from '@shared/workerPool.js';
import { NoElevationDataError } from './errors.js';
import type { WorkerRequest, WorkerResponse } from './workerProtocol.js';

export type GenerateProgress = Extract<WorkerResponse, { type: 'progress' }>;

export type GenerateResult = Extract<WorkerResponse, { type: 'done' }>;

/** Builds the model in a worker; `cancel` terminates it and rejects with `AbortError`. */
export function generateTerrainModel(
  request: WorkerRequest,
  onProgress: (progress: GenerateProgress) => void,
): { promise: Promise<GenerateResult>; cancel: () => void } {
  const { promise, resolve, reject } = Promise.withResolvers<GenerateResult>();

  let worker: Worker;

  // A CSP without `worker-src`, or a chunk that won't load, throws here.
  try {
    worker = new Worker(new URL('./terrainModelWorker.js', import.meta.url));
  } catch (err) {
    reject(
      new WorkerUnavailableError('worker could not be started', { cause: err }),
    );

    return { promise, cancel: () => {} };
  }

  worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
    switch (data.type) {
      case 'progress':
        onProgress(data);

        return;
      case 'done':
        resolve(data);

        break;
      case 'noData':
        reject(new NoElevationDataError());

        break;
      case 'error':
        reject(new Error(data.message));

        break;
    }

    worker.terminate();
  };

  // A script that fails to load reports no message.
  worker.onerror = (e) => {
    reject(
      e.message
        ? new Error(e.message)
        : new WorkerUnavailableError('worker could not be loaded'),
    );

    worker.terminate();
  };

  worker.postMessage(request);

  return {
    promise,
    cancel: () => {
      worker.terminate();

      reject(new DOMException('cancelled', 'AbortError'));
    },
  };
}
