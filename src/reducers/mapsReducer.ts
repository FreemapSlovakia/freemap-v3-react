import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { MapMeta, mapsSetList } from 'fm3/actions/mapsActions';
import {
  selectFeature,
  deleteFeature,
  clearMap,
} from 'fm3/actions/mainActions';

export interface MapsState {
  maps: MapMeta[];
  id: undefined | number;
}

const initialState: MapsState = {
  maps: [],
  id: undefined,
};

export const mapsReducer = createReducer<MapsState, RootAction>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(mapsSetList, (state, action) => ({
    ...state,
    maps: action.payload,
  }))
  .handleAction(selectFeature, (state, action) => ({
    ...state,
    id:
      (action.payload?.type === 'maps' ? action.payload.id : undefined) ??
      state.id,
  }))
  .handleAction(deleteFeature, (state, action) => ({
    ...state,
    id: undefined,
    maps:
      action.payload.type === 'maps'
        ? state.maps.filter(map => map.id !== action.payload.id)
        : state.maps,
  }));
