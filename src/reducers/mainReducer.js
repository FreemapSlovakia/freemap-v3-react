import update from 'immutability-helper';

const initialState = {
  tool: null
};


export default function lenghtMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return update(state, { tool: { $set: action.tool } } );
    default:
      return state;
  }
}
