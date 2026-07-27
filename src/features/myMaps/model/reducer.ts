import { authLogout } from '@features/auth/model/actions.js';
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
  mapsRestore,
  mapsRestoreEnded,
  mapsSetList,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from './actions.js';

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
   * The restore currently opening a map. Kept apart from `loadMeta`, which asks
   * `mapsLoadProcessor` to read the map from the backend — a restore may decide
   * not to. Held in full so the restore can resume once the auth check lands,
   * exactly as `loadMeta` lets a load resume.
   */
  restoring: MapRestore | undefined;
}

const initialState: MapsState = {
  loadMeta: undefined,
  maps: [],
  activeMap: undefined,
  offlineIds: [],
  savedFingerprint: null,
  restoring: undefined,
};

export const mapsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mapsSetList, (state, { payload }) => {
      state.maps = payload;
    })
    .addCase(mapsLoaded, (state, { payload }) => {
      state.activeMap = payload.meta;

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

      state.restoring = undefined;
    })
    .addCase(mapsSetMeta, (state, { payload }) => {
      // Merging refreshes the meta of the map already open; switching to another
      // map replaces it, or optional fields of the old one — `writers` — would
      // be carried over into a map they don't belong to.
      state.activeMap =
        state.activeMap?.id === payload.id
          ? { ...state.activeMap, ...payload }
          : payload;

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
    .addCase(mapsSetSavedFingerprint, (state, { payload }) => {
      state.savedFingerprint = payload;
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
    })),
);
