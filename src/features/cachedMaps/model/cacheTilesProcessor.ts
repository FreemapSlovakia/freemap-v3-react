import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { enumerateTilesInBbox } from '@shared/tileEnumeration.js';
import type { Dispatch } from 'redux';
import {
  cacheStaticAssets,
  deleteCachedTileMap,
  getCachedTileMaps,
  saveCachedTileMap,
} from '../cache.js';
import type { CachedTileMapDef } from '../cachedTileMaps.js';
import { toCachedLayerUrl } from '../cachedTileUrl.js';
import { loadCachedMapsMessages } from '../translations/loadCachedMapsMessages.js';
import {
  cachedMapDeleted,
  cachedMapRenamed,
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

async function downloadTiles(
  meta: CachedTileMapDef,
  dispatch: Dispatch,
  language: string,
) {
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

  const tiles = enumerateTilesInBbox(meta.bounds, minZoom, maxZoom);

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
          // match ScaledTileLayer's tile <img> requests so providers that
          // require a Referer header — e.g. OSM's usage policy — aren't blocked
          // (and 403s aren't silently counted as downloaded) during caching.
          referrerPolicy: 'strict-origin-when-cross-origin',
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

      await saveCachedTileMap(updateMeta(meta, downloaded, sizeBytes));
    }
  }

  activeDownloads.delete(id);

  if (!abortController.signal.aborted) {
    await saveCachedTileMap(updateMeta(meta, meta.tileCount, sizeBytes));

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
    window._paq.push([
      'trackEvent',
      'MapCache',
      'start',
      action.payload.sourceType,
    ]);

    // save initial metadata to IndexedDB, then download in the background;
    // surface a write failure (e.g. IndexedDB blocked) the same way as a
    // download failure instead of leaving it as an unhandled rejection
    saveCachedTileMap(action.payload)
      .then(() =>
        downloadTiles(action.payload, dispatch, getState().l10n.language),
      )
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

export const cachedMapRenamedProcessor: Processor<typeof cachedMapRenamed> = {
  actionCreator: cachedMapRenamed,
  async handle({ action, getState }) {
    const meta = getState().map.cachedMaps.find(
      (cm) => cm.type === action.payload.id,
    );

    if (meta) {
      await saveCachedTileMap(meta);
    }
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
