import { authLogout } from '@features/auth/model/actions.js';
import { routePlannerSupersedeSavedRoute } from '@features/routePlanner/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type MapLoadMeta,
  type MapMeta,
  type MapRestore,
  mapsDisconnect,
  mapsLoad,
  mapsLoaded,
  mapsLoadFailed,
  mapsOfflineIdsLoaded,
  mapsOutboxLoaded,
  mapsOutboxSyncing,
  mapsRefreshMeta,
  mapsRestore,
  mapsRestoreEnded,
  mapsSetList,
  mapsSetMeta,
  mapsSetSavedFingerprint,
  type OutboxEntry,
} from './actions.js';

/**
 * Folds a fresh answer about the map already open into what is held, never
 * moving `modifiedAt` backwards. A read that was in flight when a queued save
 * reached the server answers with the version from before it, and the
 * precondition the next save sends has to be the newest the server has given us
 * or that save is refused as a conflict with this one.
 *
 * A different map replaces outright, or optional fields of the old one —
 * `writers` — would be carried into a map they don't belong to.
 */
function mergeMeta(current: MapMeta | undefined, next: MapMeta): MapMeta {
  return current?.id !== next.id
    ? next
    : {
        ...current,
        ...next,
        modifiedAt:
          current.modifiedAt > next.modifiedAt
            ? current.modifiedAt
            : next.modifiedAt,
      };
}

export interface MapsState {
  loadMeta: MapLoadMeta | undefined;
  maps: MapMeta[];
  activeMap: MapMeta | undefined;
  offlineIds: string[];
  /**
   * Digest of the active map as last loaded or saved, against which the screen
   * is compared to tell whether there are unsaved changes.
   */
  savedFingerprint: string | null;
  /**
   * A recompute replaced the map's stored route. The digest can't see that — a
   * restore rebuilds the route from the URL, where a stored one has nowhere to
   * come from — so it is recorded outright. Cleared whenever a baseline is
   * established, which is what a load and a save both end on.
   */
  routeRecomputed: boolean;
  /**
   * The restore currently opening a map. Kept apart from `loadMeta`, which asks
   * `mapsLoadProcessor` to read the map from the backend — a restore may decide
   * not to. Held in full so the restore can resume once the auth check lands,
   * exactly as `loadMeta` lets a load resume.
   */
  restoring: MapRestore | undefined;
  /** Saves waiting to reach the server, mirrored from IndexedDB. */
  outbox: OutboxEntry[];
  /** Ids being pushed right now — transient, so it lives only here. */
  syncingIds: string[];
}

const initialState: MapsState = {
  loadMeta: undefined,
  maps: [],
  activeMap: undefined,
  offlineIds: [],
  savedFingerprint: null,
  routeRecomputed: false,
  restoring: undefined,
  outbox: [],
  syncingIds: [],
};

export const mapsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mapsSetList, (state, { payload }) => {
      state.maps = payload;
    })
    .addCase(mapsLoaded, (state, { payload }) => {
      state.activeMap = mergeMeta(state.activeMap, payload.meta);

      state.loadMeta = undefined;

      state.restoring = undefined;
    })
    .addCase(mapsLoad, (state, { payload }) => {
      state.loadMeta = payload;

      state.restoring = undefined;
    })
    // The map is claimed as soon as the restore starts, so the URL keeps its
    // `id=` while the working copy is read and a second pass doesn't re-enter.
    .addCase(mapsRestore, (state, { payload }) => {
      state.restoring = payload;

      // Withdraw any pending load of another map: it would keep that map's id in
      // the URL and, on completion, silently end this restore.
      state.loadMeta = undefined;
    })
    .addCase(mapsLoadFailed, (state) => {
      state.loadMeta = undefined;
    })
    .addCase(mapsDisconnect, (state) => {
      state.activeMap = undefined;

      state.savedFingerprint = null;

      state.routeRecomputed = false;

      state.restoring = undefined;
    })
    .addCase(mapsSetMeta, (state, { payload }) => {
      state.activeMap = mergeMeta(state.activeMap, payload);

      // This map is active now, so nothing is pending for it — but only for it.
      // A save refreshes the meta of the map already open, and clearing whatever
      // happened to be in flight would withdraw a load of a different map that
      // then never opens and reports nothing.
      if (state.loadMeta?.id === payload.id) {
        state.loadMeta = undefined;
      }

      if (state.restoring?.mapId === payload.id) {
        state.restoring = undefined;
      }
    })
    // Only the map already open, and only its meta: nothing is claimed and
    // nothing pending is released, so a load or restore under way still decides
    // what opens.
    .addCase(mapsRefreshMeta, (state, { payload }) => {
      if (state.activeMap?.id === payload.id) {
        state.activeMap = mergeMeta(state.activeMap, payload);
      }
    })
    .addCase(mapsSetSavedFingerprint, (state, { payload }) => {
      state.savedFingerprint = payload;

      state.routeRecomputed = false;
    })
    // Only the restore this belongs to: a save setting a digest while a restore
    // waits on the network would otherwise abandon it, leaving the map that was
    // open connected to the content of the one being restored — which the next
    // save would then write over it.
    .addCase(mapsRestoreEnded, (state, { payload }) => {
      if (state.restoring?.mapId === payload) {
        state.restoring = undefined;
      }
    })
    .addCase(mapsOfflineIdsLoaded, (state, { payload }) => {
      state.offlineIds = payload;
    })
    .addCase(mapsOutboxLoaded, (state, { payload }) => {
      state.outbox = payload;

      // Nothing can still be pushing a save that is no longer queued.
      state.syncingIds = state.syncingIds.filter((id) =>
        payload.some((entry) => entry.mapId === id),
      );
    })
    .addCase(mapsOutboxSyncing, (state, { payload }) => {
      state.syncingIds = payload;
    })
    .addCase(routePlannerSupersedeSavedRoute, (state) => {
      state.routeRecomputed = true;
    })
    .addCase(authLogout, (state) => ({
      ...initialState,
      activeMap: state.activeMap?.public
        ? {
            ...state.activeMap,
            canWrite: false,
            writers: undefined,
          }
        : undefined,
      // Logging out saves nothing: while the map and its edited content stay on
      // screen, so does the comparison that reports them as unsaved.
      savedFingerprint: state.activeMap?.public ? state.savedFingerprint : null,
      routeRecomputed: state.activeMap?.public ? state.routeRecomputed : false,
    })),
);
