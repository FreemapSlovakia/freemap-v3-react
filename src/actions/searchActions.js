export function doSearch(query) {
  return { type: 'SEARCH', query };
}

export function setResults(results) {
  return { type: 'SET_RESULTS', results };
}

export function highlightResult(highlightedResult) {
  return { type: 'HIGHLIGHT_RESULT', highlightedResult };
}

export function selectResult(selectedResult) {
  return { type: 'SELECT_RESULT', selectedResult };
}