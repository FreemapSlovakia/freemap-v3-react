import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  enumerateTilesInBbox,
  enumerateTilesInPolygon,
} from '@shared/tileEnumeration.js';
import { polygon } from '@turf/helpers';
import type { Dispatch } from 'redux';
import {
  cacheStaticAssets,
  deleteCachedTileMap,
  getCachedTileMaps,
  saveCachedTileMap,
} from '../cache.js';
import type { CachedTileMapDef } from '../cachedTileMaps.js';
import { toCachedLayerUrl } from '../cachedTileUrl.js';
import {
  type CacheTilesStartPayload,
  cachedMapDeleted,
  cachedMapsLoaded,
  cacheTilesCancel,
  cacheTilesComplete,
  cacheTilesError,
  cacheTilesPause,
  cacheTilesProgress,
  cacheTilesRestart,
  cacheTilesResume,
  cacheTilesStart,
} from './actions.js';

const BATCH_SIZE = 6;

const PROGRESS_INTERVAL = 50;

interface DownloadState {
  abortController: AbortController;
  paused: boolean;
  pausePromise: Promise<void> | null;
  pauseResolve: (() => void) | null;
}

const activeDownloads = new Map<string, DownloadState>();

function buildTileUrl(
  urlTemplate: string,
  x: number,
  y: number,
  z: number,
): string {
  return urlTemplate
    .replace('{x}', String(x))
    .replace('{y}', String(y))
    .replace('{z}', String(z))
    .replace('{s}', 'a');
}

function updateMeta(
  payload: CacheTilesStartPayload,
  downloadedCount: number,
  sizeBytes: number,
): CachedTileMapDef {
  return {
    ...payload.meta,
    downloadedCount,
    sizeBytes,
  };
}

async function downloadTiles(
  payload: CacheTilesStartPayload,
  dispatch: Dispatch,
) {
  const { meta, boundary } = payload;

  const id = meta.type;

  const abortController = new AbortController();

  const state: DownloadState = {
    abortController,
    paused: false,
    pausePromise: null,
    pauseResolve: null,
  };

  activeDownloads.set(id, state);

  const cache = await caches.open(meta.cacheName);

  const minZoom = meta.minZoom ?? 0;

  const maxZoom = meta.maxNativeZoom ?? 18;

  const tiles =
    boundary.type === 'bbox'
      ? enumerateTilesInBbox(boundary.bounds, minZoom, maxZoom)
      : enumerateTilesInPolygon(
          polygon([
            [
              ...boundary.points.map((pt) => [pt.lon, pt.lat]),
              [boundary.points[0].lon, boundary.points[0].lat],
            ],
          ]),
          minZoom,
          maxZoom,
        );

  let downloaded = 0;
  let sizeBytes = meta.sizeBytes;
  let lastProgressAt = 0;

  const tileArray: [number, number, number][] = [];

  for (const tile of tiles) {
    tileArray.push(tile);
  }

  const extraScales = meta.technology === 'tile' ? meta.extraScales : undefined;

  // pick the scale matching this screen's DPI
  const dpr = window.devicePixelRatio || 1;

  const bestScale = extraScales
    ?.filter((s) => s <= Math.ceil(dpr))
    .sort((a, b) => b - a)[0];

  for (let i = 0; i < tileArray.length; i += BATCH_SIZE) {
    if (abortController.signal.aborted) {
      break;
    }

    if (state.paused && state.pausePromise) {
      await state.pausePromise;
    }

    if (abortController.signal.aborted) {
      break;
    }

    const batch = tileArray.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async ([x, y, z]) => {
        const baseUrl = buildTileUrl(meta.url, x, y, z);

        const fetchUrl =
          bestScale !== undefined ? `${baseUrl}@${bestScale}x` : baseUrl;

        const cacheKey = toCachedLayerUrl(fetchUrl, id);

        // skip tiles already in cache (resume support)
        const existing = await cache.match(cacheKey);

        if (existing) {
          return;
        }

        const response = await fetch(fetchUrl, {
          signal: abortController.signal,
        });

        if (response.ok) {
          const contentLength = response.headers.get('content-length');

          if (contentLength) {
            sizeBytes += parseInt(contentLength, 10);
          } else {
            const clone = response.clone();
            const blob = await clone.blob();

            sizeBytes += blob.size;
          }

          await cache.put(cacheKey, response);
        }
      }),
    );

    downloaded += results.filter((r) => r.status === 'fulfilled').length;

    if (
      downloaded - lastProgressAt >= PROGRESS_INTERVAL ||
      i + BATCH_SIZE >= tileArray.length
    ) {
      lastProgressAt = downloaded;

      dispatch(cacheTilesProgress({ id, downloaded, sizeBytes }));

      await saveCachedTileMap(updateMeta(payload, downloaded, sizeBytes));
    }
  }

  activeDownloads.delete(id);

  if (!abortController.signal.aborted) {
    await saveCachedTileMap(updateMeta(payload, meta.tileCount, sizeBytes));

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

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 10_000,
        message: `Map "${meta.name}" cached successfully`,
        actions: [
          {
            name: 'Activate',
            action: mapToggleLayer({ type: id, enable: true }),
          },
          {
            name: 'Manage',
            action: { type: 'SET_ACTIVE_MODAL', payload: 'offline-maps' },
          },
        ],
      }),
    );
  }
}

export const cacheTilesStartProcessor: Processor<typeof cacheTilesStart> = {
  actionCreator: cacheTilesStart,
  errorKey: 'general.operationError',
  handle({ action, dispatch }) {
    // save initial metadata to IndexedDB
    saveCachedTileMap(action.payload.meta);

    // fire and forget — runs in background
    downloadTiles(action.payload, dispatch).catch((err) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      dispatch(
        cacheTilesError({
          id: action.payload.meta.type,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    });
  },
};

export const cacheTilesPauseProcessor: Processor<typeof cacheTilesPause> = {
  actionCreator: cacheTilesPause,
  handle({ action }) {
    const state = activeDownloads.get(action.payload.id);

    if (state) {
      state.paused = true;

      state.pausePromise = new Promise<void>((resolve) => {
        state.pauseResolve = resolve;
      });
    }
  },
};

export const cacheTilesResumeProcessor: Processor<typeof cacheTilesResume> = {
  actionCreator: cacheTilesResume,
  handle({ action }) {
    const state = activeDownloads.get(action.payload.id);

    if (state) {
      state.paused = false;

      state.pauseResolve?.();

      state.pausePromise = null;
      state.pauseResolve = null;
    }
  },
};

export const cacheTilesCancelProcessor: Processor<typeof cacheTilesCancel> = {
  actionCreator: cacheTilesCancel,
  async handle({ action }) {
    const state = activeDownloads.get(action.payload.id);

    if (state) {
      state.abortController.abort();
      state.pauseResolve?.();

      activeDownloads.delete(action.payload.id);
    }

    await caches.delete(`tiles-${action.payload.id}`);
    await deleteCachedTileMap(action.payload.id);
  },
};

export const cachedMapDeletedProcessor: Processor<typeof cachedMapDeleted> = {
  actionCreator: cachedMapDeleted,
  async handle({ action }) {
    // also cancel if downloading
    const state = activeDownloads.get(action.payload.id);

    if (state) {
      state.abortController.abort();
      state.pauseResolve?.();

      activeDownloads.delete(action.payload.id);
    }

    await deleteCachedTileMap(action.payload.id);
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

    const payload: CacheTilesStartPayload = {
      meta,
      boundary: { type: 'bbox', bounds: meta.bounds },
    };

    downloadTiles(payload, dispatch).catch((err) => {
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
