import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap, setTool } from 'fm3/actions/mainActions';
import {
  mapDetailsSetSubtool,
  mapDetailsSetUserSelectedPosition,
  mapDetailsSetTrackInfoPoints,
} from 'fm3/actions/mapDetailsActions';

export interface IMapDetailsState {
  userSelectedLat: number | null;
  userSelectedLon: number | null;
  subtool: string | null;
  trackInfoPoints: any[] | null;
}

const initialState: IMapDetailsState = {
  userSelectedLat: null,
  userSelectedLon: null,
  subtool: null,
  trackInfoPoints: null,
};

export default createReducer<IMapDetailsState, RootAction>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(mapDetailsSetSubtool, (state, action) => ({
    ...state,
    subtool: action.payload,
  }))
  .handleAction(mapDetailsSetUserSelectedPosition, (state, action) => ({
    ...state,
    userSelectedLat: action.payload.lat,
    userSelectedLon: action.payload.lon,
  }))
  .handleAction(mapDetailsSetTrackInfoPoints, (state, action) => ({
    ...state,
    trackInfoPoints: action.payload,
  }))
  .handleAction(setTool, (state, action) =>
    action.payload === 'map-details'
      ? { ...state, subtool: 'track-info' }
      : initialState,
  );
