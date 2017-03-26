import update from 'immutability-helper';

const initialState = {
  points: [],
};

export default function measurement(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return initialState;
    case 'MEASUREMENT_ADD_POINT':
      return update(state, { points: { $splice: [[action.payload.position === undefined ? state.points.length : 0, 0, action.payload.point]] } });
    case 'MEASUREMENT_UPDATE_POINT':
      return update(state, { points: { [action.payload.index]: { $set: action.payload.point } } });
    case 'MEASUREMENT_REMOVE_POINT':
      return update(state, { points: { $splice: [[action.payload.index, 1]] } });
    default:
      return state;
  }
}
