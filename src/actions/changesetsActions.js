export function changesetsAdd(changesets) {
  return { type: 'CHANGESETS_ADD', payload: { changesets } };
}
export function changesetsSetDays(days) {
  return { type: 'CHANGESETS_SET_DAYS', payload: { days } };
}

export function changesetsSetAuthorNameAndRefresh(authorName) {
  return { type: 'CHANGESETS_SET_AUTHOR_NAME_AND_REFRESH', payload: { authorName } };
}
