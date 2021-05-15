import { RootAction } from 'fm3/actions';
import { authLogout } from 'fm3/actions/authActions';
import { MapMeta, mapsLoad, mapsSetList } from 'fm3/actions/mapsActions';
import { createReducer } from 'typesafe-actions';

export interface MapsState {
  maps: MapMeta[];
  id: undefined | string;
}

const initialState: MapsState = {
  maps: [],
  id: undefined,
};

export const mapsReducer = createReducer<MapsState, RootAction>(initialState)
  .handleAction(mapsSetList, (state, { payload }) => ({
    ...state,
    maps: payload,
  }))
  .handleAction(mapsLoad, (state, { payload }) => ({
    ...state,
    id: payload.id,
  }))
  .handleAction(authLogout, () => initialState);
