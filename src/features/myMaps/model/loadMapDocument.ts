import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import { getOfflineMap } from '../offlineStore.js';
import type { MapData, MapMeta } from './actions.js';
import { MapsLoadResponseSchema } from './mapDocumentSchema.js';

/**
 * Fetches and parses a saved map document (`GET /maps/:id`). Shared by the
 * online load path and the offline-caching path so the endpoint and schema live
 * in one place.
 */
export async function loadMapDocument(
  id: string,
  getState: () => RootState,
  cancelActions: ActionCreatorMatchable[],
): Promise<{ meta: MapMeta; data: MapData }> {
  const res = await httpRequest({
    getState,
    url: `/maps/${id}`,
    expectedStatus: 200,
    cancelActions,
  });

  return MapsLoadResponseSchema.parse(await res.json());
}

/**
 * Reads a map document, falling back to the offline copy.
 *
 * The fallback is deliberately limited to being offline or a genuine network
 * failure: a 403/404/500 is an answer from the server and must surface, or a map
 * that was deleted or is no longer shared would keep opening from a stale cached
 * copy. Shared by the load and the restore so neither can drift from that rule.
 */
export async function readMapDocument(
  id: string,
  getState: () => RootState,
  cancelActions: ActionCreatorMatchable[],
): Promise<{ meta: MapMeta; data: MapData; fromNetwork: boolean }> {
  try {
    if (!navigator.onLine) {
      throw new Error('offline');
    }

    return {
      ...(await loadMapDocument(id, getState, cancelActions)),
      fromNetwork: true,
    };
  } catch (err) {
    const offline =
      !navigator.onLine || isNetworkError(err)
        ? await getOfflineMap(id)
        : undefined;

    if (!offline) {
      throw err;
    }

    return { ...offline, fromNetwork: false };
  }
}
