import update from 'immutability-helper';
import * as at from 'fm3/actionTypes';

const clearResult = {
  alternatives: [],
  activeAlternativeIndex: 0,
  timestamp: null,
};

const initialState = {
  transportType: null,
  start: null,
  midpoints: [],
  finish: null,
  pickMode: 'start',
  itineraryIsVisible: false,
  mode: 'route',
  ...clearResult,
};

export default function routePlanner(state = initialState, action) {
  switch (action.type) {
    case at.SET_TOOL:
      return { ...state, pickMode: !state.start ? 'start' : 'finish' };
    case at.CLEAR_MAP:
      return {
        ...initialState,
        transportType: state.transportType,
        mode: state.mode,
      };
    case at.ROUTE_PLANNER_SET_PARAMS:
      return {
        ...state,
        ...(action.payload.start === null || action.payload.finish === null ? {
          ...initialState,
          transportType: state.transportType,
          mode: state.mode,
        } : {}),
        start: action.payload.start,
        finish: action.payload.finish,
        midpoints: isSpecial(action.payload.transportType) ? [] : action.payload.midpoints,
        transportType: action.payload.transportType,
        mode: isSpecial(action.payload.transportType) ? 'route' : (action.payload.mode || 'route'),
      };
    case at.ROUTE_PLANNER_SET_START:
      return {
        ...state,
        start: action.payload.start,
        midpoints: !isSpecial(state.transportType) && !action.payload.move && state.start ? [state.start, ...state.midpoints] : state.midpoints,
        pickMode: 'finish',
      };
    case at.ROUTE_PLANNER_SET_FINISH:
      return action.payload.finish === null ? { // only possible in (round)trip mode
        ...state,
        finish: state.midpoints.length ? state.midpoints[state.midpoints.length - 1] : null,
        midpoints: state.midpoints.length ? state.midpoints.slice(0, state.midpoints.length - 1) : [],
        pickMode: state.start ? 'finish' : 'start',
      } : {
        ...state,
        finish: action.payload.finish,
        midpoints: !isSpecial(state.transportType) && !action.payload.move && state.finish ? [...state.midpoints, state.finish] : state.midpoints,
        pickMode: state.start ? 'finish' : 'start',
      };
    case at.ROUTE_PLANNER_SWAP_ENDS:
      return { ...state, start: state.finish, finish: state.start, midpoints: [...state.midpoints].reverse() };
    case at.ROUTE_PLANNER_ADD_MIDPOINT:
      return update(state, { midpoints: { $splice: [[action.payload.position, 0, action.payload.midpoint]] } });
    case at.ROUTE_PLANNER_SET_MIDPOINT:
      return update(state, { midpoints: { [action.payload.position]: { $set: action.payload.midpoint } } });
    case at.ROUTE_PLANNER_REMOVE_MIDPOINT:
      return update(state, { midpoints: { $splice: [[action.payload, 1]] } });
    case at.ROUTE_PLANNER_SET_TRANSPORT_TYPE:
      return {
        ...state,
        ...clearResult,
        transportType: action.payload,
        mode: isSpecial(action.payload) ? 'route' : state.mode,
      };
    case at.ROUTE_PLANNER_SET_MODE:
      return { ...state, ...clearResult, mode: isSpecial(state.transportType) ? 'route' : action.payload };
    case at.ROUTE_PLANNER_SET_PICK_MODE:
      return { ...state, pickMode: action.payload };
    case at.ROUTE_PLANNER_TOGGLE_ITINERARY_VISIBILITY:
      return { ...state, itineraryIsVisible: !state.itineraryIsVisible };
    case at.ROUTE_PLANNER_SET_RESULT:
      return {
        ...state,
        alternatives: action.payload.alternatives,
        timestamp: action.payload.timestamp,
        activeAlternativeIndex: 0,
        midpoints: isSpecial(action.payload.transportType) ? [] : state.midpoints,
      };
    case at.ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX:
      return { ...state, activeAlternativeIndex: action.payload };
    default:
      return state;
  }
}

function isSpecial(transportType) {
  return ['imhd', 'bikesharing'].includes(transportType);
}
