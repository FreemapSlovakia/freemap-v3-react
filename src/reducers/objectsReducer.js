const initialState = {
  objects: [],
  categories: [],
  subcategories: []
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return initialState;
    case 'OBJECTS_SET_FILTER':
      return { ...state, objects: [] };
    case 'OBJECTS_SET_RESULT':
      return { ...state, objects: action.payload };
    default:
      return state;
  }
}
