import * as at from 'fm3/actionTypes';

const initialState = {
  lat: null,
  lon: null,
  label: null,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.INFO_POINT_SET:
      return {
        ...state, lat: action.payload.lat, lon: action.payload.lon, label: action.payload.label,
      };
    case at.INFO_POINT_CHANGE_POSITION:
      return { ...state, lat: action.payload.lat, lon: action.payload.lon };
    case at.INFO_POINT_CHANGE_LABEL:
      return { ...state, label: action.payload };
    default:
      return state;
  }
}
