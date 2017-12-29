import * as at from 'fm3/actionTypes';

const initialState = {
  elevation: null,
  point: null,
};

export default function elevationMeasurement(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.ELEVATION_MEASUREMENT_SET_ELEVATION:
      return { ...state, elevation: action.payload };
    case at.ELEVATION_MEASUREMENT_SET_POINT:
      return { ...state, point: action.payload, elevation: null };
    default:
      return state;
  }
}
