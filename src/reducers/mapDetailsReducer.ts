import { RootAction } from 'fm3/actions';
import { clearMap, setTool } from 'fm3/actions/mainActions';
import {
  mapDetailsSetSubtool,
  mapDetailsSetTrackInfoPoints,
  mapDetailsSetUserSelectedPosition,
} from 'fm3/actions/mapDetailsActions';
import { createReducer } from 'typesafe-actions';

export interface MapDetailsState {
  userSelectedLat: number | null;
  userSelectedLon: number | null;
  subtool: string | null;
  trackInfoPoints: unknown | null;
}

const initialState: MapDetailsState = {
  userSelectedLat: null,
  userSelectedLon: null,
  subtool: null,
  trackInfoPoints: null,
};

export const mapDetailsReducer = createReducer<MapDetailsState, RootAction>(
  initialState,
)
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
