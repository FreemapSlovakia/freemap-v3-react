import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { cacheStaticAssets } from '@shared/offlineStaticCache.js';
import {
  countCachedOf,
  coverageContains,
  coverageIncludes,
  enumerateTilesInBbox,
  type TileCoord,
  tileRangeIndex,
} from '@shared/tileEnumeration.js';
import { buildTileUrl, withTileScale } from '@shared/tileUrl.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Dispatch } from 'redux';
import {
  deleteCachedTileMap,
  getCachedTileMaps,
  saveCachedTileMap,
  updateCachedTileMap,
} from '../cache.js';
import {
  type CachedTileMapDef,
  getCachedTileScale,
  sameCoverage,
} from '../cachedTileMaps.js';
import { toCachedLayerUrl } from '../cachedTileUrl.js';
import { loadCachedMapsMessages } from '../translations/loadCachedMapsMessages.js';
import {
  cachedMapDeleted,
  cachedMapEdited,
  cachedMapsLoaded,
  cacheTilesComplete,
  cacheTilesError,
  cacheTilesProgress,
  cacheTilesRestart,
  cacheTilesStart,
  cacheTilesStop,
} from './actions.js';

const BATCH_SIZE = 6;

// pruning only touches the local cache, so it can run wider than the download
const PRUNE_BATCH_SIZE = 32;

const PROGRESS_INTERVAL = 50;

// leading tiles probed to find the scale a map without a recorded one holds;
// more than one because a tile the server refused is simply not there
const SCALE_PROBE_TILES = 8;

const activeDownloads = new Map<string, AbortController>();

/**
 * Registers a caching pass so it can be aborted. Called before the first
 * `await`, so a stop or a delete landing in that window still finds something
 * to abort.
 */
function beginDownload(id: string): AbortController {
  const abortController = new AbortController();

  activeDownloads.set(id, abortController);

  return abortController;
}

function abortDownload(id: string): void {
  const abortController = activeDownloads.get(id);

  if (abortController) {
    abortController.abort();

    activeDownloads.delete(id);
  }
}

/** Releases the slot, unless an abort or a later pass already took it over. */
function endDownload(id: string, abortController: AbortController): void {
  if (activeDownloads.get(id) === abortController) {
    activeDownloads.delete(id);
  }
}

/**
 * Publishes a map's metadata to the store and to IndexedDB in one step, so the
 * two can't drift apart. Both sides ignore a map that has been deleted in the
 * meantime, so a pass still in flight can't bring it back.
 */
async function commitMeta(
  dispatch: Dispatch,
  meta: CachedTileMapDef,
): Promise<void> {
  dispatch(cacheTilesProgress(meta));

  await updateCachedTileMap(meta);
}

function updateMeta(
  meta: CachedTileMapDef,
  downloadedCount: number,
  sizeBytes: number,
): CachedTileMapDef {
  return {
    ...meta,
    downloadedCount,
    sizeBytes,
  };
}

function tileCacheKey(
  meta: CachedTileMapDef,
  [x, y, z]: TileCoord,
  scale: number | undefined,
): string {
  return toCachedLayerUrl(
    withTileScale(buildTileUrl(meta.url, x, y, z), scale),
    meta.type,
  );
}

/** The `@Nx` variants a map could hold when its metadata records none. */
function candidateScales(meta: CachedTileMapDef): number[] {
  return [
    ...new Set(
      meta.technology === 'tile' ? [1, ...(meta.extraScales ?? [])] : [1],
    ),
  ];
}

/** The area × zoom range a map covers, as `enumerateTilesInBbox` wants it. */
function coverageOf(meta: CachedTileMapDef) {
  return {
    bounds: meta.bounds,
    minZoom: meta.minZoom ?? 0,
    maxZoom: meta.maxNativeZoom ?? 18,
  };
}

/**
 * The scale a partly-downloaded map already holds, or `undefined` when none of
 * the probed tiles is cached at any scale. Only the leading tiles of the map's
 * own coverage are probed — a download goes through the enumeration in order,
 * so those are the ones it got to first.
 */
async function detectCachedScale(
  cache: Cache,
  meta: CachedTileMapDef,
): Promise<number | undefined> {
  const { bounds, minZoom, maxZoom } = coverageOf(meta);

  let probed = 0;

  for (const tile of enumerateTilesInBbox(bounds, minZoom, maxZoom)) {
    if (probed++ >= SCALE_PROBE_TILES) {
      break;
    }

    for (const scale of candidateScales(meta)) {
      if (await cache.match(tileCacheKey(meta, tile, scale))) {
        return scale;
      }
    }
  }

  return undefined;
}

/**
 * Walks what the map covered before an edit: tiles the new coverage no longer
 * takes in are deleted, the rest are counted. Both counters come out of this,
 * and out of the cache itself rather than out of arithmetic on the old ones —
 * `downloadedCount` is only ever a lower bound on what is really stored, and a
 * download that was interrupted holds tiles in no order the new coverage could
 * infer.
 */
async function pruneTilesOutside(
  prev: CachedTileMapDef,
  next: CachedTileMapDef,
  signal: AbortSignal,
): Promise<{ keptCount: number; removedBytes: number }> {
  const kept = tileRangeIndex(coverageOf(next));

  const scales =
    prev.tileScale === undefined ? candidateScales(prev) : [prev.tileScale];

  const cache = await caches.open(prev.cacheName);

  let keptCount = 0;
  let removedBytes = 0;

  const batch: [tile: TileCoord, keep: boolean][] = [];

  async function flush() {
    await Promise.all(
      batch.map(async ([tile, keep]) => {
        for (const scale of scales) {
          const key = tileCacheKey(prev, tile, scale);

          const existing = await cache.match(key);

          if (!existing) {
            continue;
          }

          if (keep) {
            keptCount++;

            return;
          }

          const { size } = await existing.blob();

          if (await cache.delete(key)) {
            removedBytes += size;
          }
        }
      }),
    );

    batch.length = 0;
  }

  const { bounds, minZoom, maxZoom } = coverageOf(prev);

  for (const tile of enumerateTilesInBbox(bounds, minZoom, maxZoom)) {
    if (signal.aborted) {
      break;
    }

    batch.push([tile, coverageContains(kept, tile)]);

    if (batch.length >= PRUNE_BATCH_SIZE) {
      await flush();
    }
  }

  if (!signal.aborted) {
    await flush();
  }

  return { keptCount, removedBytes };
}

async function downloadTiles(
  def: CachedTileMapDef,
  dispatch: Dispatch,
  language: string,
  abortController: AbortController = beginDownload(def.type),
) {
  const id = def.type;

  const cache = await caches.open(def.cacheName);

  const { bounds, minZoom, maxZoom } = coverageOf(def);

  const tiles = enumerateTilesInBbox(bounds, minZoom, maxZoom);

  let visited = 0;
  let sizeBytes = def.sizeBytes;
  let lastProgressAt = 0;

  const tileArray: TileCoord[] = [];

  for (const tile of tiles) {
    tileArray.push(tile);
  }

  // Pin the scale into the metadata: the render side reads it back to ask for
  // exactly the variant that is stored, and resuming must continue the variant
  // the cache already holds even if the screen's DPI says otherwise.
  const meta: CachedTileMapDef = {
    ...def,
    tileScale:
      def.tileScale ??
      (await detectCachedScale(cache, def)) ??
      getCachedTileScale(def),
  };

  // Every tile of the coverage is visited, the already-cached ones included, so
  // how far we are through them is a lower bound on how much the map holds —
  // and only a lower bound, since an extended map starts out holding more than
  // has been visited yet. Never report (or store) less than what was already
  // there, so an interruption can't record a fully cached map as barely begun.
  const cachedCount = () => Math.max(def.downloadedCount, visited);

  // tell the store which variant this settled on, so the layer asks for the one
  // that is actually stored instead of guessing from the screen's DPI
  if (meta.tileScale !== def.tileScale) {
    await commitMeta(dispatch, updateMeta(meta, cachedCount(), sizeBytes));
  }

  for (let i = 0; i < tileArray.length; i += BATCH_SIZE) {
    if (abortController.signal.aborted) {
      break;
    }

    const batch = tileArray.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async ([x, y, z]) => {
        const fetchUrl = withTileScale(
          buildTileUrl(meta.url, x, y, z),
          meta.tileScale,
        );

        const cacheKey = tileCacheKey(meta, [x, y, z], meta.tileScale);

        // skip tiles already in cache (resume support)
        const existing = await cache.match(cacheKey);

        if (existing) {
          return;
        }

        const response = await fetch(fetchUrl, {
          signal: abortController.signal,
          // match ScaledTileLayer's tile <img> requests so providers that
          // require a Referer header — e.g. OSM's usage policy — aren't blocked
          // (and 403s aren't silently counted as downloaded) during caching.
          referrerPolicy: 'strict-origin-when-cross-origin',
        });

        if (response.ok) {
          const blob = await response.blob();

          sizeBytes += blob.size;

          // Store a plain same-origin response instead of the cross-origin one:
          // a CORS response carries the tile server's `Vary` (typically
          // `Accept-Encoding, Origin`) and its CORS headers, which are
          // meaningless under the `/__cached__/` origin and only make
          // `cache.match` browser-dependent.
          await cache.put(
            cacheKey,
            new Response(blob, {
              headers: {
                'Content-Type':
                  response.headers.get('content-type') ??
                  'application/octet-stream',
              },
            }),
          );
        }
      }),
    );

    visited += results.filter((r) => r.status === 'fulfilled').length;

    if (
      visited - lastProgressAt >= PROGRESS_INTERVAL ||
      i + BATCH_SIZE >= tileArray.length
    ) {
      lastProgressAt = visited;

      await commitMeta(dispatch, updateMeta(meta, cachedCount(), sizeBytes));
    }
  }

  endDownload(id, abortController);

  const stopped = abortController.signal.aborted;

  // Committed even when stopped, so the tiles of the last part-batch — already
  // in the cache, their bytes already counted — aren't lost. A resume skips
  // them as present and would never add their size again.
  await commitMeta(
    dispatch,
    updateMeta(meta, stopped ? cachedCount() : meta.tileCount, sizeBytes),
  );

  if (!stopped) {
    // auto-cache static assets on first completed map
    const allMaps = await getCachedTileMaps();

    const completedCount = allMaps.filter(
      (m) => m.downloadedCount === m.tileCount,
    ).length;

    if (completedCount === 1) {
      try {
        await cacheStaticAssets();
      } catch {
        // not critical
      }
    }

    dispatch(cacheTilesComplete({ id }));

    const cm = await loadCachedMapsMessages(language);

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 10_000,
        messageKey: 'cachedSuccess',
        messageParams: { name: meta.name ?? '' },
        messageLoader: loadCachedMapsMessages,
        actions: [
          {
            name: cm.activate,
            action: mapToggleLayer({ type: id, enable: true }),
          },
        ],
      }),
    );
  }
}

export const cacheTilesStartProcessor: Processor<typeof cacheTilesStart> = {
  actionCreator: cacheTilesStart,
  errorKey: 'general.operationError',
  handle({ action, dispatch, getState }) {
    trackMatomo(['trackEvent', 'MapCache', 'start', action.payload.sourceType]);

    const id = action.payload.type;

    // registered up front so a stop or a delete arriving while the metadata is
    // being written finds something to abort
    const abortController = beginDownload(id);

    // save initial metadata to IndexedDB, then download in the background;
    // surface a write failure (e.g. IndexedDB blocked) the same way as a
    // download failure instead of leaving it as an unhandled rejection
    saveCachedTileMap(action.payload)
      .then(async () => {
        // a delete that beat the write would have been undone by it
        if (!getState().map.cachedMaps.some((m) => m.type === id)) {
          await deleteCachedTileMap(id);

          return;
        }

        // stopped instead: the map stays, at nothing cached yet
        if (abortController.signal.aborted) {
          endDownload(id, abortController);

          return;
        }

        await downloadTiles(
          action.payload,
          dispatch,
          getState().l10n.language,
          abortController,
        );
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        console.error(err);

        dispatch(
          cacheTilesError({
            id: action.payload.type,
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      });
  },
};

/**
 * Halts the caching pass, leaving the tiles and the metadata in place so it can
 * be picked up again later.
 */
export const cacheTilesStopProcessor: Processor<typeof cacheTilesStop> = {
  actionCreator: cacheTilesStop,
  handle({ action }) {
    abortDownload(action.payload.id);
  },
};

export const cachedMapDeletedProcessor: Processor<typeof cachedMapDeleted> = {
  actionCreator: cachedMapDeleted,
  async handle({ action }) {
    abortDownload(action.payload.id);

    await deleteCachedTileMap(action.payload.id);
  },
};

export const cachedMapEditedProcessor: Processor<typeof cachedMapEdited> = {
  actionCreator: cachedMapEdited,
  errorKey: 'general.operationError',
  async handle({ action, dispatch, getState }) {
    const { prev, next } = action.payload;

    const id = next.type;

    // a rename leaves every tile where it is
    if (sameCoverage(prev, next)) {
      await updateCachedTileMap(next);

      return;
    }

    // registered before the pruning, which can take a while on a big shrink, so
    // a stop or a delete arriving meanwhile has something to abort
    const abortController = beginDownload(id);

    const cache = await caches.open(prev.cacheName);

    // Resolve the scale from the map as it was: the edited coverage can start
    // somewhere the download never reached, where probing would find nothing
    // and fall back to whatever this screen's DPI suggests — orphaning every
    // tile already stored at the other variant.
    const tileScale =
      prev.tileScale ??
      (await detectCachedScale(cache, prev)) ??
      getCachedTileScale(prev);

    // Recorded before anything is deleted: a reload mid-prune would otherwise
    // leave the old coverage on record, claiming as Ready a map whose tiles are
    // already going. Both counters are estimates here and are replaced with
    // what the walk below actually finds.
    const meta: CachedTileMapDef = {
      ...next,
      tileScale,
      downloadedCount: countCachedOf(
        coverageOf(prev),
        coverageOf(next),
        prev.downloadedCount,
      ),
    };

    await commitMeta(dispatch, meta);

    // Widening drops nothing, so every tile the map had is still inside and its
    // own count carries over — no need to walk the cache to find that out.
    const { keptCount, removedBytes } = coverageIncludes(
      coverageOf(next),
      coverageOf(prev),
    )
      ? { keptCount: prev.downloadedCount, removedBytes: 0 }
      : await pruneTilesOutside(
          { ...prev, tileScale },
          next,
          abortController.signal,
        );

    // Stopped part-way, so these counts describe only what was walked. Leave the
    // map on the metadata committed before the pruning: writing a late partial
    // correction would clobber whatever took over meanwhile — a resumed
    // download, or a second edit. See TODO.md for the tiles left orphaned.
    if (abortController.signal.aborted) {
      endDownload(id, abortController);

      return;
    }

    const pruned: CachedTileMapDef = {
      ...meta,
      downloadedCount: keptCount,
      sizeBytes: Math.max(0, meta.sizeBytes - removedBytes),
    };

    // A delete landing here aborts, so it is caught above; and `commitMeta`
    // won't recreate a map that has gone either way.
    await commitMeta(dispatch, pruned);

    // widening only fetches what the cache lacks, and a pure shrink goes over
    // the remaining tiles and finds them all present
    downloadTiles(
      pruned,
      dispatch,
      getState().l10n.language,
      abortController,
    ).catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      dispatch(
        cacheTilesError({
          id,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    });
  },
};

export const cacheTilesRestartProcessor: Processor<typeof cacheTilesRestart> = {
  actionCreator: cacheTilesRestart,
  errorKey: 'general.operationError',
  handle({ action, dispatch, getState }) {
    const meta = getState().map.cachedMaps.find(
      (m) => m.type === action.payload.id,
    );

    if (!meta) {
      return;
    }

    downloadTiles(meta, dispatch, getState().l10n.language).catch((err) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      dispatch(
        cacheTilesError({
          id: meta.type,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    });
  },
};

export const cachedMapsLoadProcessor: Processor = {
  actionCreator: cachedMapsLoaded,
  // no handler needed — just triggers reducer
};
