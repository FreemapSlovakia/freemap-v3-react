import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { routePlannerSetSavedRoute } from '@features/routePlanner/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ensureStaticAssetsCached } from '@shared/offlineStaticCache.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Dispatch } from 'redux';
import { putOfflineMap } from '../../offlineStore.js';
import {
  deletePendingSaveIfUnchanged,
  getPendingHead,
  pendingMeta,
  putPendingSave,
} from '../../outboxStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  blockedReasonFor,
  type MapData,
  type MapMeta,
  MapMetaSchema,
  mapsLoadList,
  mapsSave,
  mapsSetMapOffline,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from '../actions.js';
import { fingerprintState, getMapDataFromState } from '../mapDocument.js';
import { block, refreshOutbox, scheduleRetry } from './mapsOutboxProcessor.js';

/**
 * Files a save the server didn't take, and returns the token that identifies it.
 * The map counts as saved from here on — the edit is durable — so what reports
 * it is the outbox badge rather than the unsaved-changes warning. The caller
 * says what happens next: sent when the connection returns, or settled by the
 * user when the server has already refused it.
 */
async function queue(
  meta: MapMeta,
  { name, writers }: { name?: string; writers?: number[] },
  data: MapData,
  fingerprint: string,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<number> {
  const queuedAt = Date.now();

  await putPendingSave({ meta, name, writers, data, queuedAt });

  // What the map is called from here on — the rename is as filed as the content.
  const filed = pendingMeta({ meta, name, writers, queuedAt });

  // Or reopening the map offline would show the server's version and the edit
  // would look lost. The stored `modifiedAt` stays the server's: it is the
  // `If-Unmodified-Since` token the replay sends.
  if (getState().myMaps.offlineIds.includes(meta.id)) {
    await putOfflineMap({ meta: filed, data });
  }

  // A rename that hasn't been sent is still what the map is called from here
  // on, or the toolbar and the list would go on showing the old name over
  // content the user was told was saved.
  if (filed.name !== meta.name || filed.writers !== meta.writers) {
    dispatch(mapsSetMeta(filed));
  }

  dispatch(mapsSetSavedFingerprint(fingerprint));

  dispatch(routePlannerSetSavedRoute(data.routePlanner?.result ?? null));

  await refreshOutbox(dispatch);

  // Nothing else would come back to this one: the connection may never have
  // been down, so there is no `online` event on the way.
  scheduleRetry(dispatch);

  // Last, and not waited on: the app has to survive a reload for the save to be
  // worth queueing, and nothing else caches the shell for a user who keeps no
  // map offline — but it is hundreds of assets, and the save is already filed.
  ensureStaticAssetsCached().catch((err) => {
    console.warn('Caching the app shell for a queued save failed:', err);
  });

  return queuedAt;
}

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  async handle({ getState, dispatch, action, toastError }) {
    try {
      const { activeMap } = getState().myMaps;

      const asNew = action.payload?.asCopy;

      const patchExisting = activeMap && !asNew;

      trackMatomo([
        'trackEvent',
        'MyMaps',
        asNew ? 'copy' : patchExisting ? 'update' : 'create',
      ]);

      // What is about to be sent becomes the reference the screen is compared
      // against, so edits made while the request is in flight still show as
      // unsaved — no bookkeeping needed, the comparison simply stops matching.
      const sent = getMapDataFromState(getState());

      const sentFingerprint = fingerprintState(getState());

      // Only an in-place save of a map this user may write can be queued: a new
      // map has no id to PATCH, and a copy is a `POST` the outbox doesn't model.
      const queueTarget =
        patchExisting && activeMap.canWrite ? activeMap : undefined;

      // A save queued earlier may carry a rename this one says nothing about.
      // Carrying it along is what lets this save stand for that one too — both
      // when it supersedes it in the outbox and when it reaches the server and
      // the queued one is dropped as settled.
      const queued = queueTarget
        ? await getPendingHead(queueTarget.id)
        : undefined;

      const metaEdits = {
        name: action.payload?.name ?? queued?.name,
        writers: action.payload?.writers ?? queued?.writers,
      };

      const fileForLater = async (target: MapMeta) => {
        await queue(
          target,
          metaEdits,
          sent,
          sentFingerprint,
          getState,
          dispatch,
        );

        dispatch(
          toastsAdd({
            id: 'myMaps.save',
            style: 'info',
            timeout: 5000,
            messageKey: 'savedToOutbox',
            messageParams: { name: metaEdits.name ?? target.name },
            messageLoader: loadMyMapsMessages,
          }),
        );
      };

      // A push of this very map is in flight, carrying the same precondition.
      // Sending a second one would leave whichever lost filed as a conflict
      // against the user's own newer content, so this save supersedes the one
      // being pushed instead and goes out on the pass that follows.
      if (
        queueTarget &&
        getState().myMaps.syncingIds.includes(queueTarget.id)
      ) {
        await fileForLater(queueTarget);

        return;
      }

      // Nothing to try while offline, and a fetch that times out would only
      // delay the same answer.
      if (queueTarget && !navigator.onLine) {
        await fileForLater(queueTarget);

        return;
      }

      let res;

      try {
        res = await httpRequest({
          getState,
          method: patchExisting ? 'PATCH' : 'POST',
          url: `/maps/${patchExisting ? activeMap.id : ''}`,
          // Only where a refusal has somewhere to go: the answers below are
          // settled by filing the save and asking the user, which needs a map
          // to file it against. Everything else surfaces as an error.
          expectedStatus: queueTarget ? [200, 403, 404, 410, 412] : [200],
          headers: patchExisting
            ? {
                'If-Unmodified-Since': activeMap.modifiedAt.toUTCString(),
              }
            : {},
          data: {
            name: metaEdits.name,
            public: true, // TODO
            writers: metaEdits.writers,
            data: sent,
          },
        });
      } catch (err) {
        // The connection dropped between the check above and the request, or
        // was never as good as `navigator.onLine` claimed.
        if (queueTarget && isNetworkError(err)) {
          await fileForLater(queueTarget);

          return;
        }

        throw err;
      }

      const refused = blockedReasonFor(res.status);

      if (queueTarget && refused) {
        // The save didn't land and its content is on screen and nowhere else,
        // so it is filed like any other save the server wouldn't take — which
        // makes it durable and hands the user the same ways out, here and from
        // the map's row in My Maps.
        const queuedAt = await queue(
          queueTarget,
          metaEdits,
          sent,
          sentFingerprint,
          getState,
          dispatch,
        );

        await block(
          queueTarget.id,
          queuedAt,
          metaEdits.name ?? queueTarget.name,
          refused,
          getState,
          dispatch,
        );

        await refreshOutbox(dispatch);

        return;
      }

      const meta = MapMetaSchema.parse(await res.json());

      // A save that reached the server supersedes the one that was queued when
      // it started. Left behind, that older document would answer
      // `readMapDocument` in place of this one and would later be replayed over
      // it — as a conflict, whose "overwrite" would put it back for good.
      //
      // Only that one, though: a save another tab filed while this request was
      // in flight is newer than what just landed and is not this save's to drop.
      // Which is also why the check is a read rather than the store mirror — the
      // mirror knows nothing of other tabs.
      if (queued) {
        await deletePendingSaveIfUnchanged(meta.id, queued.queuedAt);

        await refreshOutbox(dispatch);
      }

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          // The name comes from the response, so saving an existing map without
          // retyping its name still names it in the toast.
          messageKey: patchExisting ? 'mapUpdated' : 'mapCreated',
          messageParams: { name: meta.name },
          messageLoader: loadMyMapsMessages,
        }),
      );

      dispatch(mapsLoadList());

      dispatch(mapsSetMeta(meta));

      dispatch(mapsSetSavedFingerprint(sentFingerprint));

      // What the map holds now, so coming back to these waypoints draws it
      // rather than routing them again — the same as after a load.
      dispatch(routePlannerSetSavedRoute(sent.routePlanner?.result ?? null));

      // Deferred to here because a map being created has no id to flag until the
      // save answers with one.
      if (
        action.payload?.offline &&
        !getState().myMaps.offlineIds.includes(meta.id)
      ) {
        dispatch(mapsSetMapOffline({ id: meta.id, offline: true }));
      }
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'saveError');
    }
  },
};
