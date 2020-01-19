import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { MapMeta, mapsSetList, mapsLoad } from 'fm3/actions/mapsActions';

export interface MapsState {
  maps: MapMeta[];
  id: undefined | number;
}

const initialState: MapsState = {
  maps: [],
  id: undefined,
};

export const mapsReducer = createReducer<MapsState, RootAction>(initialState)
  .handleAction(mapsSetList, (state, action) => ({
    ...state,
    maps: action.payload,
  }))
  .handleAction(mapsLoad, (state, action) => ({
    ...state,
    id: action.payload,
  }));
