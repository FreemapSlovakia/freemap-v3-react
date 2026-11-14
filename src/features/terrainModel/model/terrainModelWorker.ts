import { decompress, init } from '@bokuweb/zstd-wasm';
import { decodeSteps } from '@shared/elevationTile.js';
import { NoElevationDataError } from './errors.js';
import { buildStl } from './stl.js';
import { type ElevationTile, neededTiles, sampleGrid } from './tileGrid.js';
import type {
  GridRequest,
  WorkerRequest,
  WorkerResponse,
} from './workerProtocol.js';

const initPromise = init();

const CONCURRENCY = 6;

function post(message: WorkerResponse, transfer: Transferable[] = []) {
  self.postMessage(message, transfer);
}

/** A premium zoom refused the token, or its absence. */
class RefusedError extends Error {}

async function fetchTile(
  r: GridRequest,
  zoom: number,
  token: string | undefined,
  x: number,
  y: number,
  attributions: Set<string>,
  signal: AbortSignal,
): Promise<ElevationTile | undefined> {
  const url = r.url
    .replace('{z}', String(zoom))
    .replace('{x}', String(x))
    .replace('{y}', String(y));

  const res = await fetch(url, {
    signal,
    ...(token && { headers: { authorization: `Bearer ${token}` } }),
  });

  // Past every source: open sea, or outside the coverage.
  if (res.status === 404) {
    return undefined;
  }

  if (res.status === 401 || res.status === 403) {
    throw new RefusedError(
      `elevation tile ${zoom}/${x}/${y}: HTTP ${res.status}`,
    );
  }

  if (!res.ok) {
    throw new Error(`elevation tile ${zoom}/${x}/${y}: HTTP ${res.status}`);
  }

  // Raw: `splitAttributionHeader` parses them on the main thread, as for the
  // other tiles, and `tileAttribution.ts` would pull the app into the worker.
  const attribution = res.headers.get('X-Attribution');

  if (attribution) {
    attributions.add(attribution);
  }

  const { side, heights } = decodeSteps(
    decompress(new Uint8Array(await res.arrayBuffer())),
  );

  return { data: heights, side, buffer: (side - 256) / 2 };
}

async function fetchTiles(
  r: GridRequest,
  zoom: number,
  token: string | undefined,
  attributions: Set<string>,
): Promise<Map<string, ElevationTile | undefined>> {
  const wanted = neededTiles(r.bbox, r.cols, r.rows, zoom);

  const tiles = new Map<string, ElevationTile | undefined>();

  let next = 0;

  // One failure stops the rest, so a retry isn't overtaken by their progress.
  const ac = new AbortController();

  const worker = async () => {
    while (next < wanted.length && !ac.signal.aborted) {
      const [x, y] = wanted[next++]!;

      const tile = await fetchTile(
        r,
        zoom,
        token,
        x,
        y,
        attributions,
        ac.signal,
      );

      if (ac.signal.aborted) {
        return;
      }

      tiles.set(`${x}/${y}`, tile);

      post({
        type: 'progress',
        phase: 'tiles',
        done: tiles.size,
        total: wanted.length,
      });
    }
  };

  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  } catch (err) {
    ac.abort();

    throw err;
  }

  return tiles;
}

self.onmessage = async (evt: MessageEvent<WorkerRequest>) => {
  const r = evt.data;

  try {
    await initPromise;

    let zoom = r.zoom;

    let attributions = new Set<string>();

    let tiles: Map<string, ElevationTile | undefined>;

    try {
      tiles = await fetchTiles(r, zoom, r.token, attributions);
    } catch (err) {
      if (!(err instanceof RefusedError) || r.zoom <= r.freeZoom) {
        throw err;
      }

      // The grid stays; it is just read from coarser data.
      zoom = r.freeZoom;

      attributions = new Set();

      tiles = await fetchTiles(r, zoom, undefined, attributions);
    }

    const heights = sampleGrid(r.bbox, r.cols, r.rows, zoom, (x, y) =>
      tiles.get(`${x}/${y}`),
    );

    tiles.clear();

    if (r.kind === 'heights') {
      if (heights.every(Number.isNaN)) {
        throw new NoElevationDataError();
      }

      post({ type: 'heights', heights }, [heights.buffer]);

      return;
    }

    let nodata = 0;

    for (const h of heights) {
      if (Number.isNaN(h)) {
        nodata++;
      }
    }

    post({ type: 'progress', phase: 'mesh' });

    const stl = buildStl(heights, r);

    post(
      {
        type: 'done',
        stl: stl.data,
        triangles: stl.triangles,
        topTriangles: stl.topTriangles,
        heightMm: stl.heightMm,
        nodata: nodata / heights.length,
        attributions: [...attributions],
        zoom,
      },
      [stl.data],
    );
  } catch (err) {
    if (err instanceof NoElevationDataError) {
      post({ type: 'noData' });

      return;
    }

    post({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
