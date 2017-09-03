const initialState = {
  lat: null,
  lon: null,
  label: null,
  inEditMode: false,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
      return initialState;
    case 'INFO_POINT_SET':
      return { ...state, lat: action.payload.lat, lon: action.payload.lon, label: action.payload.label };
    case 'INFO_POINT_CHANGE_POSITION':
      return { ...state, lat: action.payload.lat, lon: action.payload.lon, inEditMode: false };
    case 'INFO_POINT_SET_IN_EDIT_MODE':
      return { ...state, inEditMode: action.payload.inEditMode };
    case 'INFO_POINT_CHANGE_LABEL':
      return { ...state, label: action.payload.label };
    default:
      return state;
  }
}
