const initialState = {
  changesets: [],
};

export default function changesets(state = initialState, action) {
  switch (action.type) {
    case 'CHANGESETS_ADD': {
      return { ...state, changesets: action.payload.changesets };
    }
    case 'SET_TOOL':
      return initialState;
    default:
      return state;
  }
}
