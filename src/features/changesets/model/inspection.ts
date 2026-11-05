import { selectFeature } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { wantedKey } from '@features/objects/model/selectors.js';
import { osmElementOpen } from '@features/osm/model/osmElementOpen.js';
import { changesetsInspect, changesetsShowHistory } from './actions.js';
import { type DiffElement, elementKey, osmIdOf } from './changesetDiff.js';

/** Selects a changed element; the inspector shows its details. */
export function changesetElementSelect(
  element: Pick<DiffElement, 'type' | 'id'>,
) {
  return selectFeature({ type: 'changeset-element', id: elementKey(element) });
}

/**
 * Ends the inspection outright, with the history it may be drilled into from:
 * the history first, or ending the inspection would return to it.
 */
export function changesetsEndInspection() {
  return [changesetsShowHistory(null), changesetsInspect(null)];
}

/**
 * Opens the element as it is now, as its `osm-*` link does. Its panel covers
 * the inspection's, which comes back when it goes.
 */
export function changesetElementOpen(element: DiffElement) {
  return osmElementOpen(osmIdOf(element));
}

/**
 * Whether the history's element's details panel is there to hold the drill;
 * it goes without the history ending, its object reloaded out of the list.
 */
export const historyHosted = (state: RootState) =>
  state.changesetInspector.history !== null && wantedKey(state) !== undefined;
