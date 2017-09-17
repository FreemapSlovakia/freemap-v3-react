const initialState = {
  changesets: [],
  days: null,
  authorName: null,
};

export default function changesets(state = initialState, action) {
  switch (action.type) {
    case 'CLEAR_MAP':
      return initialState;
    case 'CHANGESETS_ADD':
      return { ...state, changesets: action.payload };
    case 'CHANGESETS_SET_DAYS':
      return { ...state, days: action.payload };
    case 'CHANGESETS_SET_AUTHOR_NAME':
      return { ...state, authorName: action.payload };
    default:
      return state;
  }
}
