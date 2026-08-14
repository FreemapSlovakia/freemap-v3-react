import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from 'redux';
import { putOfflineMap } from '../../offlineStore.js';
import {
  advancePendingPrecondition,
  blockPendingSave,
  deletePendingSave,
  deletePendingSaveIfUnchanged,
  getPendingHeads,
  getPendingSave,
  hasPendingSave,
  type PendingSave,
} from '../../outboxStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  BLOCKED_MESSAGE_KEYS,
  type BlockedReason,
  blockedReasonFor,
  canCopy,
  canOverwrite,
  type MapMeta,
  MapMetaSchema,
  mapsDisconnect,
  mapsLoad,
  mapsLoadList,
  mapsOutboxLoaded,
  mapsOutboxSyncing,
  mapsRefreshMeta,
  mapsResolveOutbox,
  mapsSetMapOffline,
  mapsSetMeta,
  mapsSyncOutbox,
} from '../actions.js';
import { MapsLoadResponseSchema } from '../mapDocumentSchema.js';

/** Republishes the outbox to the store, so the badges follow IndexedDB. */
export async function refreshOutbox(dispatch: Dispatch): Promise<void> {
  dispatch(
    mapsOutboxLoaded(
      (await getPendingHeads()).map(
        ({ mapId, meta, name, queuedAt, blocked }) => ({
          mapId,
          name: name ?? meta.name,
          queuedAt,
          blocked,
        }),
      ),
    ),
  );
}

/**
 * Applies a queued save that reached the server: the map that is open takes the
 * fresh `modifiedAt` — the precondition its next save will send — the save stops
 * being queued, and the offline copy catches up with what was pushed.
 *
 * Unless a newer save was queued while this one was in flight, in which case
 * that one is the local content and stays queued; it inherits the precondition
 * this push earned, or the server would refuse it as a conflict with it.
 */
async function settle(
  pending: PendingSave,
  meta: MapMeta,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<void> {
  const mapId = pending.meta.id;

  // Whatever else is going on: a load of this map may be in flight and about to
  // answer with the version from before this push, which `mapsRefreshMeta` is
  // shaped to survive.
  dispatch(mapsRefreshMeta(meta));

  if (!(await deletePendingSaveIfUnchanged(mapId, pending.queuedAt))) {
    await advancePendingPrecondition(mapId, meta.modifiedAt);

    return;
  }

  if (getState().myMaps.offlineIds.includes(mapId)) {
    await putOfflineMap({ meta, data: pending.data });
  }
}

/**
 * Stops replaying this map's save and hands the user the ways out of it, unless
 * the refusal is about a save that no longer exists — one that landed online or
 * was queued over while this push was in flight — in which case there is nothing
 * to report and nothing to settle.
 *
 * The toast carries the ways out that keep the local content, because the replay
 * runs on its own — on reconnect, at app start — with nothing of the user's open
 * to put a dialog over. Discarding is destructive and lives in the map's row in
 * My Maps instead, where it can be confirmed — except where there is nothing
 * left to lose, which is the one reason with no other way out.
 */
export async function block(
  mapId: string,
  queuedAt: number,
  name: string,
  blocked: BlockedReason,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<boolean> {
  if (!(await blockPendingSave(mapId, queuedAt, blocked))) {
    return false;
  }

  const mm = await loadMyMapsMessages(getState().l10n.language);

  dispatch(
    toastsAdd({
      // Per map, so a second conflict doesn't replace the first one's choices.
      id: `myMaps.outboxBlocked.${mapId}`,
      style: 'danger',
      messageKey: BLOCKED_MESSAGE_KEYS[blocked],
      messageParams: { name },
      messageLoader: loadMyMapsMessages,
      actions: [
        ...(canCopy(blocked)
          ? [
              {
                name: mm.outboxResolveCopy,
                action: mapsResolveOutbox({ mapId, resolution: 'copy' }),
                variant: 'primary',
              },
            ]
          : []),
        ...(canOverwrite(blocked)
          ? [
              {
                name: mm.outboxResolveOverwrite,
                // Irreversibly drops whatever the map gained meanwhile.
                action: mapsResolveOutbox({ mapId, resolution: 'overwrite' }),
                variant: 'danger',
              },
            ]
          : []),
        // Nothing to copy and nothing to overwrite with, so discarding costs
        // nothing that is still there — and is the only way out left.
        ...(canCopy(blocked) || canOverwrite(blocked)
          ? []
          : [
              {
                name: mm.outboxResolveDiscard,
                action: mapsResolveOutbox({ mapId, resolution: 'discard' }),
                variant: 'danger',
              },
            ]),
      ],
    }),
  );

  return true;
}

/**
 * What a single push ended in. `offline` and `unauthorized` are about the
 * connection rather than the save, so they stop the whole replay; anything else
 * is this save's own business and the rest of the queue carries on.
 * `superseded` is a refusal that arrived for a save that no longer exists.
 */
type PushResult =
  | 'ok'
  | 'blocked'
  | 'superseded'
  | 'offline'
  | 'unauthorized'
  | 'failed';

async function push(
  pending: PendingSave,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<PushResult> {
  const mapId = pending.meta.id;

  let res;

  try {
    res = await httpRequest({
      getState,
      method: 'PATCH',
      url: `/maps/${mapId}`,
      // Every answer is branched on below. An unexpected status must not throw:
      // it would abandon the replay with this save at the head of the queue,
      // and every one behind it would be skipped for as long as it kept failing.
      expectedStatus: null,
      headers: {
        'If-Unmodified-Since': pending.meta.modifiedAt.toUTCString(),
      },
      data: {
        name: pending.name,
        public: true, // TODO — as sent by the online save
        writers: pending.writers,
        data: pending.data,
      },
      // Nothing may cancel a replay: the save is the user's, not a view that
      // moved on, and dropping it would leave the entry queued forever.
      cancelActions: [],
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return 'offline';
    }

    throw err;
  }

  if (res.status === 200) {
    await settle(
      pending,
      MapMetaSchema.parse(await res.json()),
      getState,
      dispatch,
    );

    return 'ok';
  }

  // Nothing is wrong with the save itself, so it waits for the next validated
  // session rather than being put in front of the user as its problem.
  if (res.status === 401) {
    return 'unauthorized';
  }

  const blocked = blockedReasonFor(res.status);

  if (!blocked) {
    // A server-side failure says nothing about what to do with the save, so it
    // stays queued for the next replay rather than asking the user to settle it.
    console.error(
      `Queued save for map ${mapId} refused: ${res.status}`,
      await res.text(),
    );

    return 'failed';
  }

  return (await block(
    mapId,
    pending.queuedAt,
    pending.name ?? pending.meta.name,
    blocked,
    getState,
    dispatch,
  ))
    ? 'blocked'
    : 'superseded';
}

// One replay at a time: the `online` event, the session check at app start and
// a manual sync can all land together, and pushing the same save twice would
// make the second one conflict with the first.
let replaying = false;

// Long enough not to hammer a server that is having a bad time, short enough
// that a tab left open gets there on its own.
const RETRY_AFTER = 5 * 60_000;

let retryTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Comes back to whatever is still queued. Nothing else reliably would: the other
 * triggers are the connection returning, the session check and the user's own
 * press, and a tab that stays open — never having gone offline, because a save
 * can fail on a link that `navigator.onLine` still calls up — sees none of them.
 */
export function scheduleRetry(dispatch: Dispatch): void {
  if (retryTimer !== undefined) {
    return;
  }

  retryTimer = setTimeout(() => {
    retryTimer = undefined;

    dispatch(mapsSyncOutbox());
  }, RETRY_AFTER);
}

export const mapsOutboxProcessor: Processor = {
  actionCreator: [mapsSyncOutbox, authSetUser],
  async handle({ getState, dispatch, action, toastError }) {
    const manual = mapsSyncOutbox.match(action) && action.payload?.manual;

    const { auth } = getState();

    // Nothing can be pushed without a validated session; the `authSetUser` this
    // also runs on is what brings the app-start replay back here.
    if (!auth.user || !auth.validated) {
      return;
    }

    if (replaying) {
      // The run under way may have started before whatever this trigger is
      // about, so the trigger is re-armed rather than spent on it.
      scheduleRetry(dispatch);

      // A press that lands on a replay already under way has to say so, or it
      // reads as a button that does nothing.
      if (manual) {
        dispatch(
          toastsAdd({
            id: 'myMaps.outbox',
            style: 'info',
            timeout: 5000,
            messageKey: 'syncing',
            messageLoader: loadMyMapsMessages,
          }),
        );
      }

      return;
    }

    replaying = true;

    let progressed = false;

    try {
      // Blocked entries wait for the user's decision — replaying them would only
      // reproduce the same refusal.
      const heads = (await getPendingHeads()).filter((head) => !head.blocked);

      if (heads.length === 0) {
        await refreshOutbox(dispatch);

        if (manual) {
          dispatch(
            toastsAdd({
              id: 'myMaps.outbox',
              style: 'info',
              timeout: 5000,
              messageKey: 'outboxEmpty',
              messageLoader: loadMyMapsMessages,
            }),
          );
        }

        return;
      }

      if (!navigator.onLine) {
        if (manual) {
          dispatch(
            toastsAdd({
              id: 'myMaps.outbox',
              style: 'warning',
              timeout: 5000,
              messageKey: 'outboxOffline',
              messageLoader: loadMyMapsMessages,
            }),
          );
        }

        return;
      }

      let pushed = 0;

      let failed = 0;

      let superseded = 0;

      try {
        for (const head of heads) {
          // Only the one going out. Marking the whole pass would report every
          // queued map as sending, and would divert an explicit save of any of
          // them into the outbox as though its own push were under way.
          dispatch(mapsOutboxSyncing([head.mapId]));

          const pending = await getPendingSave(head.mapId);

          if (!pending) {
            // The head is still there, so the document is what wouldn't read
            // back. It is the only copy of that save, so it is put in front of
            // the user rather than quietly dropped — even if all that is left to
            // do with it is discard it.
            if (await hasPendingSave(head.mapId)) {
              await block(
                head.mapId,
                head.queuedAt,
                head.name ?? head.meta.name,
                'unreadable',
                getState,
                dispatch,
              );
            }

            continue;
          }

          const result = await push(pending, getState, dispatch);

          if (result === 'ok') {
            pushed++;
          } else if (result === 'superseded') {
            // A newer save stands for this map now — filed by the user or by
            // another tab while this one was in flight. It is queued in its own
            // right, and counts as movement so the pass below picks it up.
            superseded++;
          } else if (result === 'failed') {
            failed++;
          } else if (result === 'offline' || result === 'unauthorized') {
            // Not this save's fault; the rest stays queued for the next replay.
            break;
          }
        }
      } finally {
        dispatch(mapsOutboxSyncing([]));

        await refreshOutbox(dispatch);
      }

      progressed = pushed > 0 || superseded > 0;

      if (pushed > 0) {
        dispatch(mapsLoadList());
      }

      // What still has to be retried is the more useful thing to say, so it
      // wins the one toast the two share.
      if (failed > 0) {
        dispatch(
          toastsAdd({
            id: 'myMaps.outbox',
            style: 'warning',
            timeout: 5000,
            messageKey: 'outboxRetryLater',
            messageParams: { count: failed },
            messageLoader: loadMyMapsMessages,
          }),
        );
      } else if (pushed > 0) {
        dispatch(
          toastsAdd({
            id: 'myMaps.outbox',
            style: 'success',
            timeout: 5000,
            messageKey: 'outboxSynced',
            messageParams: { count: pushed },
            messageLoader: loadMyMapsMessages,
          }),
        );
      }
    } catch (err) {
      // The entries stay queued, so this is a report rather than a loss.
      await toastError(err, loadMyMapsMessages, 'outboxError', 'myMaps.outbox');
    } finally {
      replaying = false;
    }

    // One rule for what is left, rather than a trigger per way a pass can end:
    // anything still queued and not blocked gets another pass — straight away
    // when this one moved something (a save filed while it ran is newer than
    // anything it pushed), and on the timer otherwise, so a queue that can't
    // move can't spin.
    if (getState().myMaps.outbox.some((entry) => !entry.blocked)) {
      if (progressed) {
        dispatch(mapsSyncOutbox());
      } else {
        scheduleRetry(dispatch);
      }
    }
  },
};

/**
 * Puts the offline copy back in step after a resolution turned the local content
 * down: it holds what `queue()` wrote, which is now what the user chose not to
 * keep for this map. A map that is gone has nothing to re-read, so its copy goes
 * rather than being refreshed.
 */
function resettleOfflineCopy(
  mapId: string,
  blocked: BlockedReason | undefined,
  getState: () => RootState,
  dispatch: Dispatch,
): void {
  if (getState().myMaps.offlineIds.includes(mapId)) {
    dispatch(mapsSetMapOffline({ id: mapId, offline: blocked !== 'gone' }));
  }
}

export const mapsResolveOutboxProcessor: Processor<typeof mapsResolveOutbox> = {
  actionCreator: mapsResolveOutbox,
  async handle({ getState, dispatch, action, toastError }) {
    const { mapId, resolution } = action.payload;

    // Read before the entry goes: what it was blocked on decides whether the
    // map can still be read back afterwards.
    const blocked = getState().myMaps.outbox.find(
      (entry) => entry.mapId === mapId,
    )?.blocked;

    try {
      // Discarding a save for a map that is gone is the one resolution with
      // nothing to ask the server: there is no version to put in place of the
      // one being thrown away, so it settles offline like any other local
      // clean-up. Everything else ends in a request.
      const needsNetwork = !(resolution === 'discard' && blocked === 'gone');

      if (needsNetwork && !navigator.onLine) {
        dispatch(
          toastsAdd({
            id: 'myMaps.outbox',
            style: 'warning',
            timeout: 5000,
            messageKey: 'outboxOffline',
            messageLoader: loadMyMapsMessages,
          }),
        );

        return;
      }

      // Discard first: it is also the way out of a save whose document won't
      // read back, which is exactly when there is no `pending` to load.
      if (resolution === 'discard') {
        await deletePendingSave(mapId);

        const active = getState().myMaps.activeMap?.id === mapId;

        // The local content is on screen and in the offline copy, so both have
        // to give way to the server's.
        if (blocked === 'gone') {
          // Which there isn't one of, so the map is left behind instead.
          if (active) {
            dispatch(mapsDisconnect());
          }

          resettleOfflineCopy(mapId, blocked, getState, dispatch);
        } else if (active) {
          // A load puts the stored map on screen and writes it through to the
          // offline copy on its way, so it settles both at once.
          dispatch(
            mapsLoad({ id: mapId, ignoreMap: true, ignoreLayers: true }),
          );
        } else {
          resettleOfflineCopy(mapId, blocked, getState, dispatch);
        }

        dispatch(mapsLoadList());

        return;
      }

      const pending = await getPendingSave(mapId);

      if (!pending) {
        return;
      }

      if (resolution === 'overwrite') {
        // Read the map only for its current `modifiedAt`: sending that as the
        // precondition is what makes this save win, while still refusing to
        // write over a version that changes between this read and the write.
        const res = await httpRequest({
          getState,
          url: `/maps/${mapId}`,
          expectedStatus: 200,
          cancelActions: [],
        });

        // Only the meta; the document itself is picked apart for nothing here.
        const {
          meta: { modifiedAt },
        } = MapsLoadResponseSchema.pick({ meta: true }).parse(await res.json());

        const result = await push(
          { ...pending, meta: { ...pending.meta, modifiedAt } },
          getState,
          dispatch,
        );

        if (result !== 'ok') {
          // `blocked` says so itself; the rest would otherwise answer a press
          // with nothing at all.
          if (result !== 'blocked') {
            if (result === 'failed') {
              scheduleRetry(dispatch);
            }

            dispatch(
              toastsAdd({
                id: 'myMaps.outbox',
                style: 'warning',
                timeout: 5000,
                messageKey:
                  result === 'offline' ? 'outboxOffline' : 'outboxRetryLater',
                messageParams: { count: 1 },
                messageLoader: loadMyMapsMessages,
              }),
            );
          }

          return;
        }
      } else {
        const mm = await loadMyMapsMessages(getState().l10n.language);

        const res = await httpRequest({
          getState,
          method: 'POST',
          url: '/maps/',
          expectedStatus: 200,
          cancelActions: [],
          data: {
            name: mm.outboxCopyName(pending.name ?? pending.meta.name),
            public: true, // TODO — as sent by the online save
            data: pending.data,
          },
        });

        const meta = MapMetaSchema.parse(await res.json());

        await deletePendingSave(mapId);

        // The copy is what the local content belongs to now, so further saves
        // go to it rather than back into the map that refused this one.
        if (getState().myMaps.activeMap?.id === mapId) {
          dispatch(mapsSetMeta(meta));
        }

        // The map that refused it is left as the server has it — its offline
        // copy still holds the content that has just gone to the copy instead.
        resettleOfflineCopy(mapId, blocked, getState, dispatch);

        dispatch(
          toastsAdd({
            style: 'success',
            timeout: 5000,
            messageKey: 'mapCreated',
            messageParams: { name: meta.name },
            messageLoader: loadMyMapsMessages,
          }),
        );
      }

      dispatch(mapsLoadList());
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'outboxError', 'myMaps.outbox');
    } finally {
      await refreshOutbox(dispatch);
    }
  },
};
