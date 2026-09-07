import {
  createWorkerPool,
  type WorkerPool,
  WorkerUnavailableError,
} from '@shared/workerPool.js';
import {
  decodeDepth,
  depthOf,
  type PanoramaDepth,
  type PanoramaDepthMeta,
} from './depth.js';

let pool: WorkerPool | null = null;

/**
 * Made on the first render rather than at import: the panorama is one tool of
 * many, and most sessions never open it.
 *
 * **Never torn down.** Renders are serialised, so this is one worker, idle
 * between them, and it costs a few megabytes for the life of the page. Giving
 * it back when the map is cleared was tried and was worse than it was worth:
 * the teardown had to be reached from an eagerly-registered processor, which
 * either dragged the decoder into the main bundle or fetched a chunk on every
 * `clearMapFeatures`, and destroying the pool under a decode still in flight
 * rejects it — which the caller below cannot tell from a worker that never
 * started, and would answer by decoding in the page, the very freeze this
 * exists to avoid.
 */
function getPool(): WorkerPool {
  pool ??= createWorkerPool(
    () => new Worker(new URL('./depthWorker.js', import.meta.url)),
  );

  return pool;
}

/**
 * One render's distance buffer, decoded in a worker — several million loop
 * iterations and two buffers the size of the picture, which on the main thread
 * is what froze the page as a render landed.
 *
 * Falls back to decoding here where a worker cannot be had at all: a picture
 * that answers distances late is worth more than one that never answers them.
 */
export async function decodeDepthOffThread(
  blob: Blob,
  width: number,
  height: number,
  meta: PanoramaDepthMeta,
): Promise<PanoramaDepth> {
  try {
    const values = await getPool().addJob<Uint16Array>(() => [
      // A `Blob` clones by reference, so there is nothing here to transfer.
      { blob, width, height },
      [],
    ]);

    return depthOf(values, { width, height, meta });
  } catch (err) {
    // Only where there was no worker to run it in. A job that ran and threw
    // threw on the data — a short part, a body that is not gzip — and would
    // throw again here, having first paid the whole gunzip on the main thread.
    if (!(err instanceof WorkerUnavailableError)) {
      throw err;
    }

    // Whatever stopped the worker stopped the pool with it; the next render
    // makes a fresh one.
    pool = null;

    console.warn('panorama depth worker unavailable; decoding in page', err);

    return decodeDepth(blob, width, height, meta);
  }
}
