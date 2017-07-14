const initialState = {
  userSelectedLat: null,
  userSelectedLon: null,
  subtool: null,
  trackInfoPoints: null,
};

export default function mapDetails(state = initialState, action) {
  switch (action.type) {
    case 'MAP_DETAILS_SET_SUBTOOL': {
      return { ...state, subtool: action.payload.subtool };
    }
    case 'MAP_DETAILS_SET_USER_SELECTED_POSITION': {
      return { ...state, userSelectedLat: action.payload.lat, userSelectedLon: action.payload.lon };
    }
    case 'MAP_DETAILS_SET_TRACK_INFO_POINTS': {
      return { ...state, trackInfoPoints: action.payload.trackInfoPoints };
    }
    case 'SET_TOOL':
      return initialState;
    default:
      return state;
  }
}
