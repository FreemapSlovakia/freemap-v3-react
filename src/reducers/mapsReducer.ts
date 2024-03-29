import { RootAction } from 'fm3/actions';
import { authLogout } from 'fm3/actions/authActions';
import {
  MapLoadMeta,
  MapMeta,
  mapsDisconnect,
  mapsLoad,
  mapsLoaded,
  mapsSetList,
  mapsSetMeta,
} from 'fm3/actions/mapsActions';
import { createReducer } from 'typesafe-actions';

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

export const mapsReducer = createReducer<MapsState, RootAction>(initialState)
  .handleAction(mapsSetList, (state, { payload }) => ({
    ...state,
    maps: payload,
  }))
  .handleAction(mapsLoaded, (state, { payload }) => ({
    ...state,
    activeMap: payload.meta,
    loadMeta: undefined,
  }))
  .handleAction(mapsLoad, (state, { payload }) => ({
    ...state,
    loadMeta: payload,
  }))
  .handleAction(mapsDisconnect, (state) => ({
    ...state,
    activeMap: undefined,
  }))
  .handleAction(mapsSetMeta, (state, { payload }) => ({
    ...state,
    activeMap: state.activeMap
      ? Object.assign({}, state.activeMap, payload)
      : payload,
  }))
  .handleAction(authLogout, (state) => ({
    ...initialState,
    activeMap: state.activeMap?.public
      ? {
          ...state.activeMap,
          canWrite: false,
          writers: undefined,
        }
      : undefined,
  }));
