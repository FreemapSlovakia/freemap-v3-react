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
    case 'MAP_RESET':
    case 'SET_TOOL':
      return initialState;
    case 'ROUTE_PLANNER_SET_START':
      return { ...state, start: action.payload, pickMode: state.finish ? 'midpoint' : 'finish' };
    case 'ROUTE_PLANNER_SET_FINISH':
      return { ...state, finish: action.payload, pickMode: state.start ? 'midpoint' : 'finish' };
    case 'ROUTE_PLANNER_ADD_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.payload.position, 0, action.payload.midpoint ] ] } });
    case 'ROUTE_PLANNER_SET_MIDPOINT':
      return update(state, { midpoints: { [ action.payload.position ]: { $set: action.payload.midpoint } } });
    case 'ROUTE_PLANNER_REMOVE_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.payload, 1 ] ] } });
    case 'ROUTE_PLANNER_SET_TRANSPORT_TYPE':
      return { ...state, transportType: action.payload };
    case 'ROUTE_PLANNER_SET_PICK_MODE':
      return { ...state, pickMode: action.payload };
    case 'ROUTE_PLANNER_SET_RESULT':
      return { ...state,
        shapePoints: action.payload.shapePoints,
        distance: action.payload.distance,
        time: action.payload.time
      };
    default:
      return state;
  }
}
