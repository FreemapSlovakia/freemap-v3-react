import { WorkerUnavailableError } from '@shared/workerPool.js';
import { NoElevationDataError } from './errors.js';
import type {
  GridRequest,
  WorkerRequest,
  WorkerResponse,
} from './workerProtocol.js';

export type GenerateProgress = Extract<WorkerResponse, { type: 'progress' }>;

export type GenerateResult = Extract<WorkerResponse, { type: 'done' }>;

export type HeightsResult = Extract<WorkerResponse, { type: 'heights' }>;

type Run<T> = { promise: Promise<T>; cancel: () => void };

/** One job in a worker of its own; `cancel` terminates it and rejects with `AbortError`. */
function run<T extends WorkerResponse>(
  request: WorkerRequest,
  /** The answer this request expects; any other is a protocol error. */
  expected: T['type'],
  onProgress: (progress: GenerateProgress) => void,
): Run<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

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
      case 'noData':
        reject(new NoElevationDataError());

        break;
      case 'error':
        reject(new Error(data.message));

        break;
      default:
        if (data.type === expected) {
          resolve(data as T);
        } else {
          reject(new Error(`unexpected worker response: ${data.type}`));
        }
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

/** Builds the model in a worker. */
export function generateTerrainModel(
  request: Omit<Extract<WorkerRequest, { kind: 'stl' }>, 'kind'>,
  onProgress: (progress: GenerateProgress) => void,
): Run<GenerateResult> {
  return run({ kind: 'stl', ...request }, 'done', onProgress);
}

/** Only the sampled heights, for the preview. */
export function fetchHeights(request: GridRequest): Run<HeightsResult> {
  return run({ kind: 'heights', ...request }, 'heights', () => {});
}
