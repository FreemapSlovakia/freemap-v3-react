const initialState = {
  lat: null,
  lon: null,
  label: null,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'CLEAR_MAP':
      return initialState;
    case 'INFO_POINT_SET':
      return { ...state, lat: action.payload.lat, lon: action.payload.lon, label: action.payload.label };
    case 'INFO_POINT_CHANGE_POSITION':
      return { ...state, lat: action.payload.lat, lon: action.payload.lon };
    case 'INFO_POINT_CHANGE_LABEL':
      return { ...state, label: action.payload };
    default:
      return state;
  }
}
