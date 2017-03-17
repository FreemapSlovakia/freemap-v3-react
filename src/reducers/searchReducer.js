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
      return (action.tool == 'search') ? state : initialState;
    case 'SEARCH':
      return { ...state, query: action.query };
    case 'SET_RESULTS':
      return { ...state, results: action.results };
    case 'HIGHLIGHT_RESULT':
      return { ...state, highlightedResult: action.highlightedResult };
    case 'SELECT_RESULT':
      return { ...state, selectedResult: action.selectedResult, highlightedResult: null };
    default:
      return state;
  }
}
