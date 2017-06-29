const initialState = {
  changesets: [],
  days: 3,
  authorName: null,
};

export default function changesets(state = initialState, action) {
  switch (action.type) {
    case 'CHANGESETS_ADD':
      return { ...state, changesets: action.payload.changesets };
    case 'CHANGESETS_SET_DAYS':
      return { ...state, days: action.payload.days };
    case 'CHANGESETS_SET_AUTHOR_NAME_AND_REFRESH':
      return { ...state, authorName: action.payload.authorName };
    case 'SET_TOOL':
      return initialState;
    default:
      return state;
  }
}
