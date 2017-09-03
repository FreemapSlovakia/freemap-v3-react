const initialState = {
  objects: [],
  categories: [],
  subcategories: [],
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
      return initialState;
    case 'OBJECTS_SET_RESULT':
      return { ...state, objects: [...state.objects, ...action.payload] };
    default:
      return state;
  }
}
