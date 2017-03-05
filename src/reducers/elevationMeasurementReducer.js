import update from 'immutability-helper';

const initialState = {
  elevation: null,
  point: null
};

export default function elevationMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'SET_ELEVATION':
      return update(state, { elevation: { $set: action.elevation } } );
    case 'SET_ELEVATION_POINT':
      return update(state, { point: { $set: action.point } } );
    default:
      return state;
  }
}
