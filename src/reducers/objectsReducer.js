import update from 'immutability-helper';

const initialState = {
  objects: [],
  categories: [],
  subcategories: []
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return initialState;
    case 'SET_OBJECTS_FILTER':
      return update(state, { objects: { $set: [] } } );
    case 'SET_OBJECTS':
      return update(state, { objects: { $set: action.objects } } );
    default:
      return state;
  }
}
