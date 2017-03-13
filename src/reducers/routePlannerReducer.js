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
    case 'SET_TOOL':
      return initialState;
    case 'SET_ROUTE_PLANNER_START':
      return update(state, { start: { $set: action.start }, pickMode: { $set: state.finish ? 'midpoint' : 'finish' } } );
    case 'SET_ROUTE_PLANNER_FINISH':
      return update(state, { finish: { $set: action.finish }, pickMode: { $set: state.start ? 'midpoint' : 'finish' } } );
    case 'ADD_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.position, 0, action.midpoint ] ] } });
    case 'SET_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { [ action.position ]: { $set: action.midpoint } } });
    case 'REMOVE_ROUTE_PLANNER_MIDPOINT':
      return update(state, { midpoints: { $splice: [ [ action.position, 1 ] ] } });
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
