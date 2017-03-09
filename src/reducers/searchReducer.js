import update from 'immutability-helper';

const initialState = {
  query: null,
  results: [],
  highlightedResult: null,
  selectedResult: null
};

export default function Search(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return (action.tool == 'search') ? state : initialState;
    case 'SEARCH':
      return update(state, { query: { $set: action.query } });
    case 'SET_RESULTS':
      return update(state, { results: { $set: action.results } });
    case 'HIGHLIGHT_RESULT':
      return update(state, { highlightedResult: { $set: action.highlightedResult } });
    case 'SELECT_RESULT':
      return update(state, { selectedResult: { $set: action.selectedResult }, highlightedResult: { $set: null } });
    default:
      return state;
  }
}
