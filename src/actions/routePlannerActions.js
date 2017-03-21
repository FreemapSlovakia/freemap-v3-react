export function setStart(start) {
  return { type: 'SET_ROUTE_PLANNER_START', payload: start };
}

export function setFinish(finish) {
  return { type: 'SET_ROUTE_PLANNER_FINISH', payload: finish };
}

export function addMidpoint(midpoint, position) {
  return { type: 'ADD_ROUTE_PLANNER_MIDPOINT', payload: { midpoint, position } };
}

export function setMidpoint(position, midpoint) {
  return { type: 'SET_ROUTE_PLANNER_MIDPOINT', payload: { midpoint, position } };
}

export function removeMidpoint(position) {
  return { type: 'REMOVE_ROUTE_PLANNER_MIDPOINT', payload: position };
}

export function setTransportType(transportType) {
  return { type: 'SET_ROUTE_PLANNER_TRANSPORT_TYPE', payload: transportType };
}

export function setPickMode(pickMode) {
  return { type: 'SET_ROUTE_PLANNER_PICK_MODE', payload: pickMode };
}

export function setRoutePlannerResult(shapePoints, distance, time) {
  return { type: 'SET_ROUTE_PLANNER_RESULT', payload: { shapePoints, distance, time } };
}
