export function setStart(start) {
  return { type: 'SET_ROUTE_PLANNER_START', start };
}

export function setFinish(finish) {
  return { type: 'SET_ROUTE_PLANNER_FINISH', finish };
}

export function addMidpoint(midpoint) {
  return { type: 'ADD_ROUTE_PLANNER_MIDPOINT', midpoint };
}

export function setMidpoint(position, midpoint) {
  return { type: 'SET_ROUTE_PLANNER_MIDPOINT', position, midpoint };
}

export function setTransportType(transportType) {
  return { type: 'SET_ROUTE_PLANNER_TRANSPORT_TYPE', transportType };
}

export function setPickMode(pickMode) {
  return { type: 'SET_ROUTE_PLANNER_PICK_MODE', pickMode };
}
