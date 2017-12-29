import * as at from 'fm3/actionTypes';

const initialState = {
  changesets: [],
  days: null,
  authorName: null,
};

export default function changesets(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.CHANGESETS_SET:
      return { ...state, changesets: action.payload };
    case at.CHANGESETS_SET_DAYS:
      return { ...state, days: action.payload };
    case at.CHANGESETS_SET_AUTHOR_NAME:
      return { ...state, authorName: action.payload };
    default:
      return state;
  }
}
