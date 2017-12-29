import * as at from 'fm3/actionTypes';

export function changesetsSet(changesets) {
  return { type: at.CHANGESETS_SET, payload: changesets };
}

export function changesetsSetDays(days) {
  return { type: at.CHANGESETS_SET_DAYS, payload: days };
}

export function changesetsSetAuthorName(authorName) {
  return { type: at.CHANGESETS_SET_AUTHOR_NAME, payload: authorName };
}
