import * as at from 'fm3/actionTypes';

export function routePlannerSetStart(start, move) {
  return { type: at.ROUTE_PLANNER_SET_START, payload: { start, move } };
}

export function routePlannerSetFinish(finish, move) {
  return { type: at.ROUTE_PLANNER_SET_FINISH, payload: { finish, move } };
}

export function routePlannerAddMidpoint(midpoint, position) {
  return { type: at.ROUTE_PLANNER_ADD_MIDPOINT, payload: { midpoint, position } };
}

export function routePlannerSetMidpoint(position, midpoint) {
  return { type: at.ROUTE_PLANNER_SET_MIDPOINT, payload: { midpoint, position } };
}

export function routePlannerRemoveMidpoint(position) {
  return { type: at.ROUTE_PLANNER_REMOVE_MIDPOINT, payload: position };
}

export function routePlannerSetTransportType(transportType) {
  return { type: at.ROUTE_PLANNER_SET_TRANSPORT_TYPE, payload: transportType };
}

export function routePlannerSetMode(mode) {
  return { type: at.ROUTE_PLANNER_SET_MODE, payload: mode };
}

export function routePlannerSetPickMode(pickMode) {
  return { type: at.ROUTE_PLANNER_SET_PICK_MODE, payload: pickMode };
}

export function routePlannerSetResult(payload) {
  return { type: at.ROUTE_PLANNER_SET_RESULT, payload };
}

export function routePlannerToggleItineraryVisibility() {
  return { type: at.ROUTE_PLANNER_TOGGLE_ITINERARY_VISIBILITY };
}

export function routePlannerSetParams(start, finish, midpoints, transportType, mode) {
  return {
    type: at.ROUTE_PLANNER_SET_PARAMS,
    payload: {
      start, finish, midpoints, transportType, mode,
    },
  };
}

export function routePlannerPreventHint() {
  return { type: at.ROUTE_PLANNER_PREVENT_HINT };
}

export function routePlannerSetActiveAlternativeIndex(index) {
  return { type: at.ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX, payload: index };
}

export function routePlannerToggleElevationChart() {
  return { type: at.ROUTE_PLANNER_TOGGLE_ELEVATION_CHART };
}

export function routePlannerSwapEnds() {
  return { type: at.ROUTE_PLANNER_SWAP_ENDS };
}
