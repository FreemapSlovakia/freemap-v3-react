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
      return { ...state, start: action.payload, pickMode: state.finish ? 'midpoint' : 'finish' };
    case 'SET_ROUTE_PLANNER_FINISH':
      return { ...state, finish: action.payload, pickMode: state.start ? 'midpoint' : 'finish' };
    case 'ADD_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.payload.position, 0, action.payload.midpoint ] ] } });
    case 'SET_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { [ action.payload.position ]: { $set: action.payload.midpoint } } });
    case 'REMOVE_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.payload, 1 ] ] } });
    case 'SET_ROUTE_PLANNER_TRANSPORT_TYPE':
      return { ...state, transportType: action.payload };
    case 'SET_ROUTE_PLANNER_PICK_MODE':
      return { ...state, pickMode: action.payload };
    case 'SET_ROUTE_PLANNER_RESULT':
      return { ...state,
        shapePoints: action.payload.shapePoints,
        distance: action.payload.distance,
        time: action.payload.time
      };
    default:
      return state;
  }
}
