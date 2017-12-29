import * as at from 'fm3/actionTypes';

export function searchSetQuery(query) {
  return { type: at.SEARCH_SET_QUERY, payload: query };
}

export function searchSetResults(results) {
  return { type: at.SEARCH_SET_RESULTS, payload: results };
}

export function searchHighlightResult(highlightedResult) {
  return { type: at.SEARCH_HIGHLIGHT_RESULT, payload: highlightedResult };
}

export function searchSelectResult(selectedResult) {
  return { type: at.SEARCH_SELECT_RESULT, payload: selectedResult };
}
