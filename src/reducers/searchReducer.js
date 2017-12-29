import * as at from 'fm3/actionTypes';

const initialState = {
  query: null,
  results: [],
  highlightedResult: null,
  selectedResult: null,
  inProgress: false,
};

export default function Search(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.SEARCH_SET_QUERY:
      return { ...state, query: action.payload, inProgress: true };
    case at.SEARCH_SET_RESULTS:
      return { ...state, results: action.payload, inProgress: false };
    case at.SEARCH_HIGHLIGHT_RESULT:
      return { ...state, highlightedResult: action.payload };
    case at.SEARCH_SELECT_RESULT:
      return { ...state, selectedResult: action.payload, highlightedResult: null };
    default:
      return state;
  }
}
