import update from 'immutability-helper';
import * as at from 'fm3/actionTypes';

const initialState = {
  start: null,
  midpoints: [],
  finish: null,
  transportType: null,
  effectiveTransportType: null,
  pickMode: 'start',
  itineraryIsVisible: false,
  alternatives: [],
  activeAlternativeIndex: 0,
  timestamp: null,
};

export default function routePlanner(state = initialState, action) {
  switch (action.type) {
    case at.SET_TOOL:
      return { ...state, pickMode: !state.start ? 'start' : !state.finish ? 'finish' : null };
    case at.CLEAR_MAP:
      return {
        ...initialState,
        transportType: state.transportType,
      };
    case at.ROUTE_PLANNER_SET_PARAMS:
      return {
        ...state,
        ...(action.payload.start === null || action.payload.finish === null ? {
          ...initialState,
          transportType: state.transportType,
        } : {}),
        start: action.payload.start,
        finish: action.payload.finish,
        midpoints: action.payload.transportType === 'imhd' ? [] : action.payload.midpoints,
        transportType: action.payload.transportType,
      };
    case at.ROUTE_PLANNER_SET_START:
      return { ...state, start: action.payload, pickMode: state.finish ? null : 'finish' };
    case at.ROUTE_PLANNER_SET_FINISH:
      return { ...state, finish: action.payload, pickMode: state.start ? null : 'finish' };
    case at.ROUTE_PLANNER_SWAP_ENDS:
      return { ...state, start: state.finish, finish: state.start, midpoints: [...state.midpoints].reverse() };
    case at.ROUTE_PLANNER_ADD_MIDPOINT:
      return update(state, { midpoints: { $splice: [[action.payload.position, 0, action.payload.midpoint]] } });
    case at.ROUTE_PLANNER_SET_MIDPOINT:
      return update(state, { midpoints: { [action.payload.position]: { $set: action.payload.midpoint } } });
    case at.ROUTE_PLANNER_REMOVE_MIDPOINT:
      return update(state, { midpoints: { $splice: [[action.payload, 1]] } });
    case at.ROUTE_PLANNER_SET_TRANSPORT_TYPE:
      return { ...state, transportType: action.payload };
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
        effectiveTransportType: action.payload.transportType,
        midpoints: action.payload.transportType === 'imhd' ? [] : state.midpoints,
      };
    case at.ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX:
      return { ...state, activeAlternativeIndex: action.payload };
    default:
      return state;
  }
}
