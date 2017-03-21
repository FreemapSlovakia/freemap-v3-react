const initialState = {
  query: null,
  results: [],
  highlightedResult: null,
  selectedResult: null
};

export default function Search(state = initialState, action) {
  switch (action.type) {
    case 'RESET_MAP':
    case 'SET_TOOL':
      return action.payload === 'search' ? state : initialState;
    case 'SEARCH':
      return { ...state, query: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'HIGHLIGHT_RESULT':
      return { ...state, highlightedResult: action.payload };
    case 'SELECT_RESULT':
      return { ...state, selectedResult: action.payload, highlightedResult: null };
    default:
      return state;
  }
}
