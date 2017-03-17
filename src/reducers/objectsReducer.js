const initialState = {
  objects: [],
  categories: [],
  subcategories: []
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'RESET_MAP':
    case 'SET_TOOL':
      return initialState;
    case 'SET_OBJECTS_FILTER':
      return Object.assign({}, state, { objects: [] } );
    case 'SET_OBJECTS':
      return Object.assign({}, state, { objects: action.objects } );
    default:
      return state;
  }
}
