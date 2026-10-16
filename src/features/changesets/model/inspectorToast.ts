import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { wantedKey } from '@features/objects/model/selectors.js';
import { osmLoad } from '@features/osm/model/osmActions.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import { loadChangesetsMessages } from '../translations/loadChangesetsMessages.js';
import { changesetsInspect, changesetsShowHistory } from './actions.js';
import {
  type DiffElement,
  elementKey,
  osmIdKey,
  osmIdOf,
} from './changesetDiff.js';

const TOAST_ID = 'changeset.inspector';

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

/** Opens the element as it is now, as its `osm-*` link does. */
export function changesetElementOpen(element: DiffElement) {
  const id = osmIdOf(element);

  return [
    osmLoad({ ids: [id], focus: true, pin: true }),
    selectFeature({ type: 'search', id }),
  ];
}

/**
 * Whether the history's element's details toast is there to hold the drill;
 * it goes without the history ending, its object reloaded out of the list.
 */
export const historyHosted = (state: RootState) =>
  state.changesetInspector.history !== null && wantedKey(state) !== undefined;

// A string, so it compares equal until a level changes. Run on every action,
// so cheap where there is nothing to show.
const levels = (state: RootState) => {
  const { history, inspected } = state.changesetInspector;

  if (!history && !inspected) {
    return '';
  }

  const { selection } = state.main;

  return [
    historyHosted(state),
    history && osmIdKey(history.id),
    inspected?.id,
    selection?.type === 'changeset-element' && selection.id,
  ].join('|');
};

/**
 * An inspection's toast, unless its history's details toast holds it. Re-added
 * only on a change of level, so a dismissed one stays dismissed.
 */
export const changesetInspectorProcessor: Processor = {
  stateChangePredicate: levels,
  handle: ({ getState, dispatch }) => {
    const state = getState();

    if (!state.changesetInspector.inspected || historyHosted(state)) {
      if (state.toasts.toasts[TOAST_ID]) {
        dispatch(toastsRemove(TOAST_ID));
      }

      return;
    }

    dispatch(
      toastsAdd({
        id: TOAST_ID,
        messageKey: 'inspector',
        messageLoader: loadChangesetsMessages,
        onClose: changesetsEndInspection(),
        style: 'info',
      }),
    );
  },
};
