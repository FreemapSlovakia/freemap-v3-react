import update from 'immutability-helper';

const initialState = {
  points: [],
};

export default function measurement(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return initialState;
    case 'DISTANCE_MEASUREMENT_ADD_POINT':
      return update(state, { points: { $splice: [[action.payload.position === undefined ? state.points.length : action.payload.position, 0, action.payload.point]] } });
    case 'DISTANCE_MEASUREMENT_UPDATE_POINT':
      return update(state, { points: { [action.payload.index]: { $set: action.payload.point } } });
    case 'DISTANCE_MEASUREMENT_REMOVE_POINT':
      return { ...state, points: state.points.filter(({ id }) => id !== action.payload) };
    default:
      return state;
  }
}
