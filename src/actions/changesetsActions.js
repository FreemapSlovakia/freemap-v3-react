export function changesetsAdd(changesets) {
  return { type: 'CHANGESETS_ADD', payload: { changesets } };
}
export function changesetsSetDays(days) {
  return { type: 'CHANGESETS_SET_DAYS', payload: { days } };
}

export function changesetsRefresh() {
  return { type: 'CHANGESETS_REFRESH' };
}
