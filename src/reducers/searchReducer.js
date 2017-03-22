const initialState = {
  query: null,
  results: [],
  highlightedResult: null,
  selectedResult: null
};

export default function Search(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return action.payload === 'search' ? state : initialState;
    case 'SEARCH_SET_QUERY':
      return { ...state, query: action.payload };
    case 'SEARCH_SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SEARCH_HIGHLIGHT_RESULT':
      return { ...state, highlightedResult: action.payload };
    case 'SEARCH_SELECT_RESULT':
      return { ...state, selectedResult: action.payload, highlightedResult: null };
    default:
      return state;
  }
}
