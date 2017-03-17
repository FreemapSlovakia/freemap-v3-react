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
      return { ...state, objects: [] };
    case 'SET_OBJECTS':
      return { ...state, objects: action.objects };
    default:
      return state;
  }
}
