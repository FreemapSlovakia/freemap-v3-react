export function searchSetQuery(query) {
  return { type: 'SEARCH_SET_QUERY', payload: query };
}

export function searchSetResults(results) {
  return { type: 'SEARCH_SET_RESULTS', payload: results };
}

export function searchHighlightResult(highlightedResult) {
  return { type: 'SEARCH_HIGHLIGHT_RESULT', payload: highlightedResult };
}

export function searchSelectResult(selectedResult) {
  return { type: 'SEARCH_SELECT_RESULT', payload: selectedResult };
}
