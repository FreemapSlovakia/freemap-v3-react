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
    case 'SET_CATEGORIES':
      return update(state, { categories: { $set: action.categories } } );
    case 'SET_SUBCATEGORIES':
      return update(state, { subcategories: { $set: action.subcategories } } );
    default:
      return state;
  }
}
