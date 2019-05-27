import * as at from 'fm3/actionTypes';

const initialState = {
  userSelectedLat: null,
  userSelectedLon: null,
  subtool: null,
  trackInfoPoints: null,
};

export default function mapDetails(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.MAP_DETAILS_SET_SUBTOOL:
      return { ...state, subtool: action.payload };
    case at.MAP_DETAILS_SET_USER_SELECTED_POSITION:
      return {
        ...state,
        userSelectedLat: action.payload.lat,
        userSelectedLon: action.payload.lon,
      };
    case at.MAP_DETAILS_SET_TRACK_INFO_POINTS:
      return { ...state, trackInfoPoints: action.payload };
    case at.SET_TOOL:
      return action.payload === 'map-details'
        ? { ...state, subtool: 'track-info' }
        : initialState;
    default:
      return state;
  }
}
