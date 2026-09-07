import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import { getOfflineMap } from '../offlineStore.js';
import { getPendingSave, pendingMeta } from '../outboxStore.js';
import { canStandInForMap, type MapData, type MapMeta } from './actions.js';
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
 *
 * A save still waiting in the outbox comes first, and answers even online: it is
 * newer than anything the server can say, so reading over it would take the edit
 * off the screen while it is still on its way there. Its meta is the one queued
 * with it, which carries the `If-Unmodified-Since` token the replay sends.
 *
 * Except for a save blocked because the map is gone, which has nothing to be the
 * newer version of: answering with it would keep opening a deleted map as though
 * it were there instead of letting the 404 surface. And a save blocked because
 * write access was withdrawn answers with `canWrite` taken away, which is what
 * the server just said — the content stays on screen, and Save offers to keep it
 * as the user's own copy rather than retrying a write that can only 403.
 */
export async function readMapDocument(
  id: string,
  getState: () => RootState,
  cancelActions: ActionCreatorMatchable[],
): Promise<{ meta: MapMeta; data: MapData; fromNetwork: boolean }> {
  const pending = await getPendingSave(id);

  if (pending && canStandInForMap(pending.blocked)) {
    const meta = pendingMeta(pending);

    return {
      meta:
        pending.blocked === 'forbidden' ? { ...meta, canWrite: false } : meta,
      data: pending.data,
      fromNetwork: false,
    };
  }

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
