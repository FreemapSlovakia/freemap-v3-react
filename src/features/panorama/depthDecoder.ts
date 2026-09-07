import { createWorkerPool, type WorkerPool } from '@shared/workerPool.js';
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
 */
function getPool(): WorkerPool {
  pool ??= createWorkerPool(
    () => new Worker(new URL('./depthWorker.js', import.meta.url)),
  );

  return pool;
}

/** Lets the workers go with the picture they decoded. */
export function destroyDepthDecoder(): void {
  pool?.destroy();

  pool = null;
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
    // A worker that failed to start stays failed, so the pool goes with it and
    // the next render makes a fresh one.
    destroyDepthDecoder();

    console.warn('panorama depth worker failed; decoding in page', err);

    return decodeDepth(blob, width, height, meta);
  }
}
