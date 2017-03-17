import update from 'immutability-helper';

const initialState = {
  start: null,
  midpoints: [],
  finish: null,
  transportType: 'car',
  pickMode: 'start',
  points: [],
  shapePoints: null,
  distance: null,
  time: null
};


export default function routePlanner(state = initialState, action) {
  switch (action.type) {
    case 'RESET_MAP':
    case 'SET_TOOL':
      return initialState;
    case 'SET_ROUTE_PLANNER_START':
      return { ...state, start: action.start, pickMode: state.finish ? 'midpoint' : 'finish' };
    case 'SET_ROUTE_PLANNER_FINISH':
      return { ...state, finish: action.finish, pickMode: state.start ? 'midpoint' : 'finish' };
    case 'ADD_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.position, 0, action.midpoint ] ] } });
    case 'SET_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { [ action.position ]: { $set: action.midpoint } } });
    case 'REMOVE_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.position, 1 ] ] } });
    case 'SET_ROUTE_PLANNER_TRANSPORT_TYPE':
      return { ...state, transportType: action.transportType };
    case 'SET_ROUTE_PLANNER_PICK_MODE':
      return { ...state, pickMode: action.pickMode };
    case 'SET_ROUTE_PLANNER_RESULT':
      return { ...state,
        shapePoints: action.shapePoints,
        distance: action.distance,
        time: action.time
      };
    default:
      return state;
  }
}
