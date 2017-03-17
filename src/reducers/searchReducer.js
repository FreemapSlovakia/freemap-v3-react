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
      return Object.assign({}, state, { query: action.query });
    case 'SET_RESULTS':
      return Object.assign({}, state, { results: action.results });
    case 'HIGHLIGHT_RESULT':
      return Object.assign({}, state, { highlightedResult: action.highlightedResult });
    case 'SELECT_RESULT':
      return Object.assign({}, state, { selectedResult: action.selectedResult, highlightedResult: null });
    default:
      return state;
  }
}
