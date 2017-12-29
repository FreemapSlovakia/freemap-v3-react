import * as at from 'fm3/actionTypes';

const initialState = {
  objects: [],
  categories: [],
  subcategories: [],
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.OBJECTS_SET_RESULT:
      return { ...state, objects: [...state.objects, ...action.payload] };
    default:
      return state;
  }
}
