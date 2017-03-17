const initialState = {
  elevation: null,
  point: null
};

export default function elevationMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'RESET_MAP':
    case 'SET_TOOL':
      return initialState;
    case 'SET_ELEVATION':
      return Object.assign({}, state, { elevation: action.elevation } );
    case 'SET_ELEVATION_POINT':
      return Object.assign({}, state, { point: action.point } );
    default:
      return state;
  }
}
