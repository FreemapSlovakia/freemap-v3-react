import { RootAction } from 'fm3/actions';
import { authLogout } from 'fm3/actions/authActions';
import {
  MapMeta,
  mapsDataLoaded,
  mapsLoad,
  mapsSetList,
} from 'fm3/actions/mapsActions';
import { createReducer } from 'typesafe-actions';

export interface MapsState {
  maps: MapMeta[];
  id: undefined | string;
  name: undefined | string;
}

const initialState: MapsState = {
  maps: [],
  id: undefined,
  name: undefined,
};

export const mapsReducer = createReducer<MapsState, RootAction>(initialState)
  .handleAction(mapsSetList, (state, { payload }) => ({
    ...state,
    maps: payload,
    name: state.id && payload.find((m) => m.id === state.id)?.name,
  }))
  .handleAction(mapsLoad, (state, { payload }) => ({
    ...state,
    id: payload.id,
    name: payload.id ? state.name : undefined,
  }))
  .handleAction(mapsDataLoaded, (state, { payload }) => ({
    ...state,
    name: payload.name,
  }))
  .handleAction(authLogout, (state) => ({ ...initialState, id: state.id }));
