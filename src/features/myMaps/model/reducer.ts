import { createReducer } from '@reduxjs/toolkit';
import { authLogout } from '../../auth/model/actions.js';
import {
  MapLoadMeta,
  MapMeta,
  mapsDisconnect,
  mapsLoad,
  mapsLoaded,
  mapsSetList,
  mapsSetMeta,
} from './actions.js';

export interface MapsState {
  loadMeta: MapLoadMeta | undefined;
  maps: MapMeta[];
  activeMap: MapMeta | undefined;
}

const initialState: MapsState = {
  loadMeta: undefined,
  maps: [],
  activeMap: undefined,
};

export const mapsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mapsSetList, (state, { payload }) => {
      state.maps = payload;
    })
    .addCase(mapsLoaded, (state, { payload }) => {
      state.activeMap = payload.meta;

      state.loadMeta = undefined;
    })
    .addCase(mapsLoad, (state, { payload }) => {
      state.loadMeta = payload;
    })
    .addCase(mapsDisconnect, (state) => {
      state.activeMap = undefined;
    })
    .addCase(mapsSetMeta, (state, { payload }) => {
      state.activeMap = { ...(state.activeMap ?? {}), ...payload };
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
