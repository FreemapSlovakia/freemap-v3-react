export function addChangesets(changesets) {
  return { type: 'CHANGESETS_ADD', payload: { changesets } };
}
