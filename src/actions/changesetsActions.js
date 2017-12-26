export function changesetsSet(changesets) {
  return { type: 'CHANGESETS_SET', payload: changesets };
}

export function changesetsSetDays(days) {
  return { type: 'CHANGESETS_SET_DAYS', payload: days };
}

export function changesetsSetAuthorName(authorName) {
  return { type: 'CHANGESETS_SET_AUTHOR_NAME', payload: authorName };
}
