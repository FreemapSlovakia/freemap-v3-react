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


export default function lenghtMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'SET_ROUTE_PLANNER_START':
      return update(state, { start: { $set: action.start } } );
    case 'SET_ROUTE_PLANNER_FINISH':
      return update(state, { finish: { $set: action.finish } } );
    case 'ADD_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $push: [ action.midpoint ] } });
    case 'SET_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { [ action.position ]: { $set: action.midpoint } } });
    case 'SET_ROUTE_PLANNER_TRANSPORT_TYPE':
      return update(state, { transportType: { $set: action.transportType } } );
    case 'SET_ROUTE_PLANNER_PICK_MODE':
      return update(state, { pickMode: { $set: action.pickMode } } );
    case 'SET_ROUTE_PLANNER_RESULT':
      return update(state, {
        shapePoints: { $set: action.shapePoints },
        distance: { $set: action.distance },
        time: { $set: action.time }
      });
    default:
      return state;
  }
}
