import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { authLogout } from '@features/auth/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  ensureStaticAssetsCached,
  maybeClearStaticCache,
} from '@shared/offlineStaticCache.js';
import type { Dispatch } from 'redux';
import {
  clearOfflineMaps,
  deleteOfflineMap,
  getOfflineMap,
  getOfflineMapIds,
  putOfflineMap,
} from '../../offlineStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import type { MapMeta } from '../actions.js';
import {
  mapsOfflineIdsLoaded,
  mapsSetAllOffline,
  mapsSetMapOffline,
} from '../actions.js';
import { loadMapDocument } from '../loadMapDocument.js';

const CONCURRENCY = 4;

/** Fetches a map document from the server and stores it for offline use. */
async function cacheMapOffline(
  id: string,
  getState: () => RootState,
): Promise<void> {
  await putOfflineMap(await loadMapDocument(id, getState, [authLogout]));
}

async function pool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (i < items.length) {
        await worker(items[i++]);
      }
    }),
  );
}

async function syncIds(dispatch: Dispatch): Promise<void> {
  dispatch(mapsOfflineIdsLoaded(await getOfflineMapIds()));
}

export const mapsSetMapOfflineProcessor: Processor<typeof mapsSetMapOffline> = {
  actionCreator: mapsSetMapOffline,
  async handle({ action, getState, dispatch, toastError }) {
    const { id, offline } = action.payload;

    try {
      if (offline) {
        await cacheMapOffline(id, getState);

        await ensureStaticAssetsCached();
      } else {
        await deleteOfflineMap(id);

        await maybeClearStaticCache();
      }
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'offlineError');
    } finally {
      await syncIds(dispatch);
    }
  },
};

export const mapsSetAllOfflineProcessor: Processor<typeof mapsSetAllOffline> = {
  actionCreator: mapsSetAllOffline,
  async handle({ action, getState, dispatch }) {
    const offline = action.payload;

    if (!offline) {
      // Remove every offline copy, including any whose map is no longer in the
      // loaded list, so nothing is orphaned.
      await pool(await getOfflineMapIds(), (id) => deleteOfflineMap(id));

      await maybeClearStaticCache();

      await syncIds(dispatch);

      return;
    }

    const existing = new Set(await getOfflineMapIds());

    const ids = getState()
      .myMaps.maps.map((map) => map.id)
      .filter((id) => !existing.has(id));

    if (ids.length === 0) {
      return;
    }

    let failed = 0;

    await pool(ids, async (id) => {
      try {
        await cacheMapOffline(id, getState);
      } catch {
        failed++;
      }
    });

    await ensureStaticAssetsCached();

    await syncIds(dispatch);

    dispatch(
      toastsAdd({
        style: failed ? 'warning' : 'success',
        timeout: 5000,
        messageKey: failed ? 'offlineCachedPartial' : 'offlineCachedAll',
        messageParams: { count: ids.length - failed, failed },
        messageLoader: loadMyMapsMessages,
      }),
    );
  },
};

/** Drops all offline maps when the user logs out. */
export const mapsOfflinePurgeProcessor: Processor = {
  actionCreator: authLogout,
  async handle({ dispatch }) {
    await clearOfflineMaps();

    await maybeClearStaticCache();

    dispatch(mapsOfflineIdsLoaded([]));
  },
};

/**
 * Re-fetches offline-flagged maps whose server copy is newer than the cached
 * one. Driven by the freshly fetched map list, so it runs only when the user
 * opens My Maps online — never on every app start.
 */
export async function refreshStaleOfflineMaps(
  list: MapMeta[],
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<void> {
  const offlineIds = new Set(await getOfflineMapIds());

  const flagged = list.filter((meta) => offlineIds.has(meta.id));

  // Read cached copies in parallel to compare modifiedAt.
  const cached = await Promise.all(
    flagged.map((meta) => getOfflineMap(meta.id)),
  );

  const stale = flagged
    .filter((meta, i) => {
      const c = cached[i];

      return !c || meta.modifiedAt.getTime() > c.meta.modifiedAt.getTime();
    })
    .map((meta) => meta.id);

  if (stale.length === 0) {
    return;
  }

  await pool(stale, async (id) => {
    try {
      await cacheMapOffline(id, getState);
    } catch {
      // leave the older cached copy in place on failure
    }
  });

  dispatch(mapsOfflineIdsLoaded(await getOfflineMapIds()));
}
