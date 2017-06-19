const initialState = {
  lat: null,
  lon: null,
  text: null,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'INFO_POINT_ADD': {
      return { ...state, lat: action.payload.lat, lon: action.payload.lon, label: action.payload.label };
    }
    case 'SET_TOOL':
      return initialState;
    default:
      return state;
  }
}
