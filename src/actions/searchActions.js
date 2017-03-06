export function doSearch(query) {
  return { type: 'SEARCH', query };
}

export function highlightResult(highlightedResult) {
  return { type: 'HIGHLIGHT_RESULT', highlightedResult };
}

export function selectResult(selectedResult) {
  return { type: 'SELECT_RESULT', selectedResult };
}