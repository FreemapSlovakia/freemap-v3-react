export function routePlannerSetStart(start) {
  return { type: 'ROUTE_PLANNER_SET_START', payload: start };
}

export function routePlannerSetFinish(finish) {
  return { type: 'ROUTE_PLANNER_SET_FINISH', payload: finish };
}

export function routePlannerAddMidpoint(midpoint, position) {
  return { type: 'ROUTE_PLANNER_ADD_MIDPOINT', payload: { midpoint, position } };
}

export function routePlannerSetMidpoint(position, midpoint) {
  return { type: 'ROUTE_PLANNER_SET_MIDPOINT', payload: { midpoint, position } };
}

export function routePlannerRemoveMidpoint(position) {
  return { type: 'ROUTE_PLANNER_REMOVE_MIDPOINT', payload: position };
}

export function routePlannerSetTransportType(transportType) {
  return { type: 'ROUTE_PLANNER_SET_TRANSPORT_TYPE', payload: transportType };
}

export function routePlannerSetPickMode(pickMode) {
  return { type: 'ROUTE_PLANNER_SET_PICK_MODE', payload: pickMode };
}

export function routePlannerSetResult(shapePoints, distance, time) {
  return { type: 'ROUTE_PLANNER_SET_RESULT', payload: { shapePoints, distance, time } };
}
