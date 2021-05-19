import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { createReducer } from 'typesafe-actions';

export interface MapDetailsState {
  userSelectedLat: number | null;
  userSelectedLon: number | null;
}

const initialState: MapDetailsState = {
  userSelectedLat: null,
  userSelectedLon: null,
};

export const mapDetailsReducer = createReducer<MapDetailsState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(mapDetailsSetUserSelectedPosition, (state, action) => ({
    ...state,
    userSelectedLat: action.payload.lat,
    userSelectedLon: action.payload.lon,
  }));
