import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  cacheStaticAssets,
  deleteCachedTileMap,
  getCachedTileMaps,
  saveCachedTileMap,
} from '@shared/cache.js';
import type { CachedTileMapDef } from '@shared/cachedTileMaps.js';
import {
  enumerateTilesInBbox,
  enumerateTilesInPolygon,
} from '@shared/tileEnumeration.js';
import { polygon } from '@turf/helpers';
import type { Dispatch } from 'redux';
import {
  type CacheTilesStartPayload,
  cachedMapDeleted,
  cachedMapsLoaded,
  cacheTilesCancel,
  cacheTilesComplete,
  cacheTilesError,
  cacheTilesPause,
  cacheTilesProgress,
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

function buildMeta(
  payload: CacheTilesStartPayload,
  cacheName: string,
  downloadedCount: number,
  sizeBytes: number,
): CachedTileMapDef {
  return {
    id: payload.id,
    name: payload.name,
    sourceType: payload.sourceType,
    technology: payload.technology,
    urlTemplate: payload.urlTemplate,
    layer: 'base',
    minZoom: payload.minZoom,
    maxZoom: payload.maxZoom,
    bounds: payload.bounds,
    tileCount: payload.tileCount,
    downloadedCount,
    cacheName,
    createdAt: new Date().toISOString(),
    sizeBytes,
    extraScales: payload.extraScales,
    scaleWithDpi: payload.scaleWithDpi,
    attribution: payload.attribution,
  };
}

async function downloadTiles(
  payload: CacheTilesStartPayload,
  dispatch: Dispatch,
) {
  const { id, urlTemplate, boundary } = payload;

  const cacheName = `tiles-${id}`;

  const abortController = new AbortController();

  const state: DownloadState = {
    abortController,
    paused: false,
    pausePromise: null,
    pauseResolve: null,
  };

  activeDownloads.set(id, state);

  const cache = await caches.open(cacheName);

  const tiles =
    boundary.type === 'bbox'
      ? enumerateTilesInBbox(boundary.bounds, payload.minZoom, payload.maxZoom)
      : enumerateTilesInPolygon(
          polygon([
            [
              ...boundary.points.map((pt) => [pt.lon, pt.lat]),
              [boundary.points[0].lon, boundary.points[0].lat],
            ],
          ]),
          payload.minZoom,
          payload.maxZoom,
        );

  let downloaded = 0;
  let sizeBytes = 0;
  let lastProgressAt = 0;

  const tileArray: [number, number, number][] = [];

  for (const tile of tiles) {
    tileArray.push(tile);
  }

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
        const baseUrl = buildTileUrl(urlTemplate, x, y, z);

        // pick the scale matching this screen's DPI
        const dpr = window.devicePixelRatio || 1;

        const bestScale = payload.extraScales
          ?.filter((s) => s <= Math.ceil(dpr))
          .sort((a, b) => b - a)[0];

        const tileUrl =
          bestScale !== undefined
            ? `${baseUrl}@${bestScale}x`
            : baseUrl;

        const response = await fetch(tileUrl, {
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

          await cache.put(tileUrl, response);
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

      await saveCachedTileMap(
        buildMeta(payload, cacheName, downloaded, sizeBytes),
      );
    }
  }

  activeDownloads.delete(id);

  if (!abortController.signal.aborted) {
    await saveCachedTileMap(
      buildMeta(payload, cacheName, payload.tileCount, sizeBytes),
    );

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
        message: `Map "${payload.name}" cached successfully`,
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
    saveCachedTileMap(
      buildMeta(action.payload, `tiles-${action.payload.id}`, 0, 0),
    );

    // fire and forget — runs in background
    downloadTiles(action.payload, dispatch).catch((err) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      dispatch(
        cacheTilesError({
          id: action.payload.id,
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

export const cachedMapsLoadProcessor: Processor = {
  actionCreator: cachedMapsLoaded,
  // no handler needed — just triggers reducer
};
