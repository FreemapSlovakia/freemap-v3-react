import update from 'immutability-helper';

const initialState = {
  start: null,
  midpoints: [],
  finish: null,
  transportType: null,
  pickMode: 'start',
  itineraryIsVisible: false,
  alternatives: [],
};


export default function routePlanner(state = initialState, action) {
  switch (action.type) {
    case 'CLEAR_MAP':
      return {
        ...initialState,
        transportType: state.transportType,
      };
    case 'ROUTE_PLANNER_SET_PARAMS':
      return {
        ...state,
        start: action.payload.start,
        finish: action.payload.finish,
        midpoints: action.payload.midpoints,
        transportType: action.payload.transportType,
      };
    case 'ROUTE_PLANNER_SET_START':
      return { ...state, start: action.payload, pickMode: state.finish ? null : 'finish' };
    case 'ROUTE_PLANNER_SET_FINISH':
      return { ...state, finish: action.payload, pickMode: state.start ? null : 'finish' };
    case 'ROUTE_PLANNER_ADD_MIDPOINT':
      return update(state, { midpoints: { $splice: [[action.payload.position, 0, action.payload.midpoint]] } });
    case 'ROUTE_PLANNER_SET_MIDPOINT':
      return update(state, { midpoints: { [action.payload.position]: { $set: action.payload.midpoint } } });
    case 'ROUTE_PLANNER_REMOVE_MIDPOINT':
      return update(state, { midpoints: { $splice: [[action.payload, 1]] } });
    case 'ROUTE_PLANNER_SET_TRANSPORT_TYPE':
      return { ...state, transportType: action.payload };
    case 'ROUTE_PLANNER_SET_PICK_MODE':
      return { ...state, pickMode: action.payload };
    case 'ROUTE_PLANNER_TOGGLE_ITINERARY_VISIBILITY':
      return { ...state, itineraryIsVisible: !state.itineraryIsVisible };
    case 'ROUTE_PLANNER_SET_RESULT':
      return {
        ...state,
        alternatives: action.payload,
        // shapePoints: action.payload.shapePoints,
        // itinerary: action.payload.itinerary,
        // distance: action.payload.distance,
        // time: action.payload.time,
      };
    default:
      return state;
  }
}
