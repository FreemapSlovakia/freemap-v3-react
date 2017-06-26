const initialState = {
  changesets: [],
  days: 3,
};

export default function changesets(state = initialState, action) {
  switch (action.type) {
    case 'CHANGESETS_ADD': {
      return { ...state, changesets: action.payload.changesets };
    }
    case 'CHANGESETS_SET_DAYS': {
      return { ...state, days: action.payload.days };
    }
    case 'SET_TOOL':
      return initialState;
    case 'CHANGESETS_REFRESH':
    default:
      return state;
  }
}
