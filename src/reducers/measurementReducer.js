import update from 'immutability-helper';

const initialState = {
  points: []
};

export default function measurement(state = initialState, action) {
  switch (action.type) {
    case 'RESET_MAP':
    case 'SET_TOOL':
      return initialState;
    case 'ADD_MEASUREMENT_POINT':
      return update(state, { points: { $push: [ action.point ] } });
    case 'UPDATE_MEASUREMENT_POINT':
      return update(state, { points: { [ action.index ]: { $set: action.point } } });
    default:
      return state;
  }
}
