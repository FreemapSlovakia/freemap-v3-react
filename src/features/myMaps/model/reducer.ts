import { authLogout } from '@features/auth/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type MapLoadMeta,
  type MapMeta,
  mapsDisconnect,
  mapsLoad,
  mapsLoaded,
  mapsOfflineIdsLoaded,
  mapsRestore,
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
   * The map a restore is currently opening. Kept apart from `loadMeta`, which
   * asks `mapsLoadProcessor` to read the map from the backend — a restore may
   * decide not to, and must not have that decision made for it when the auth
   * check lands mid-flight.
   */
  restoringId: string | undefined;
}

const initialState: MapsState = {
  loadMeta: undefined,
  maps: [],
  activeMap: undefined,
  offlineIds: [],
  savedFingerprint: null,
  restoringId: undefined,
};

export const mapsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mapsSetList, (state, { payload }) => {
      state.maps = payload;
    })
    .addCase(mapsLoaded, (state, { payload }) => {
      state.activeMap = payload.meta;

      state.loadMeta = undefined;

      state.restoringId = undefined;
    })
    .addCase(mapsLoad, (state, { payload }) => {
      state.loadMeta = payload;

      state.restoringId = undefined;
    })
    // The map is claimed as soon as the restore starts, so the URL keeps its
    // `id=` while the working copy is read and a second pass doesn't re-enter.
    .addCase(mapsRestore, (state, { payload }) => {
      state.restoringId = payload.mapId;

      // Withdraw any pending load of another map: it would keep that map's id in
      // the URL and, on completion, silently end this restore.
      state.loadMeta = undefined;
    })
    .addCase(mapsDisconnect, (state) => {
      state.activeMap = undefined;

      state.savedFingerprint = null;

      state.restoringId = undefined;
    })
    .addCase(mapsSetMeta, (state, { payload }) => {
      state.activeMap = { ...(state.activeMap ?? {}), ...payload };

      // The map is active now, so nothing is pending.
      state.loadMeta = undefined;

      state.restoringId = undefined;
    })
    // Every restore ends by setting the digest, including the paths that never
    // reach a meta — so this is where an in-flight restore is finally released.
    .addCase(mapsSetSavedFingerprint, (state, { payload }) => {
      state.savedFingerprint = payload;

      state.restoringId = undefined;
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
