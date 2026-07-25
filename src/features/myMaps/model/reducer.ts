import { authLogout } from '@features/auth/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type MapLoadMeta,
  type MapMeta,
  mapsDisconnect,
  mapsLoad,
  mapsLoaded,
  mapsOfflineIdsLoaded,
  mapsSetDirty,
  mapsSetList,
  mapsSetMeta,
} from './actions.js';

export interface MapsState {
  loadMeta: MapLoadMeta | undefined;
  maps: MapMeta[];
  activeMap: MapMeta | undefined;
  offlineIds: string[];
  /** The active map has unsaved local changes. */
  dirty: boolean;
}

const initialState: MapsState = {
  loadMeta: undefined,
  maps: [],
  activeMap: undefined,
  offlineIds: [],
  dirty: false,
};

export const mapsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mapsSetList, (state, { payload }) => {
      state.maps = payload;
    })
    .addCase(mapsLoaded, (state, { payload }) => {
      state.activeMap = payload.meta;

      state.loadMeta = undefined;

      state.dirty = false;
    })
    .addCase(mapsLoad, (state, { payload }) => {
      state.loadMeta = payload;
    })
    .addCase(mapsDisconnect, (state) => {
      state.activeMap = undefined;

      state.dirty = false;
    })
    .addCase(mapsSetMeta, (state, { payload }) => {
      state.activeMap = { ...(state.activeMap ?? {}), ...payload };
    })
    .addCase(mapsSetDirty, (state, { payload }) => {
      state.dirty = payload;
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
    })),
);
