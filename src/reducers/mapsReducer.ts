import { RootAction } from 'fm3/actions';
import { authLogout } from 'fm3/actions/authActions';
import { MapMeta, mapsLoad, mapsSetList } from 'fm3/actions/mapsActions';
import { createReducer } from 'typesafe-actions';

export interface MapsState {
  maps: MapMeta[] | undefined;
  id: undefined | number;
}

const initialState: MapsState = {
  maps: undefined,
  id: undefined,
};

export const mapsReducer = createReducer<MapsState, RootAction>(initialState)
  .handleAction(mapsSetList, (state, action) => ({
    ...state,
    maps: action.payload,
  }))
  .handleAction(mapsLoad, (state, action) => ({
    ...state,
    id: action.payload.id,
  }))
  .handleAction(authLogout, () => initialState);
