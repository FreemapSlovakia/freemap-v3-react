export function doSearch(query) {
  return { type: 'SEARCH', payload: query };
}

export function setResults(results) {
  return { type: 'SET_RESULTS', payload: results };
}

export function highlightResult(highlightedResult) {
  return { type: 'HIGHLIGHT_RESULT', payload: highlightedResult };
}

export function selectResult(selectedResult) {
  return { type: 'SELECT_RESULT', payload: selectedResult };
}
