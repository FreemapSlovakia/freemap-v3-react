import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadChangesetsMessages } from '../translations/loadChangesetsMessages.js';
import {
  type Changeset,
  changesetsInspect,
  changesetsSetParams,
} from './actions.js';
import { type DiffElement, elementKey } from './changesetDiff.js';
import { selectedDiffElementSelector } from './selectors.js';

/** A changeset's details, until the query or the inspection changes. */
export function changesetDetail(changeset: Changeset) {
  return toastsAdd({
    id: 'changeset.detail',
    messageKey: 'detail',
    messageLoader: loadChangesetsMessages,
    messageParams: {
      changeset,
    },
    cancelType: [changesetsSetParams.type, changesetsInspect.type],
    style: 'info',
  });
}

/** Selects a changed element; its details follow the selection. */
export function changesetElementSelect(element: DiffElement) {
  return selectFeature({ type: 'changeset-element', id: elementKey(element) });
}

/** A selected changed element's details, however it was selected. */
export const changesetElementDetailProcessor: Processor<typeof selectFeature> =
  {
    actionCreator: selectFeature,
    actionPredicate: (action) => action.payload?.type === 'changeset-element',
    handle: ({ dispatch, getState }) => {
      const element = selectedDiffElementSelector(getState());

      if (!element) {
        return;
      }

      const id = elementKey(element);

      dispatch(
        toastsAdd({
          id: 'changeset.element',
          messageKey: 'elementDetail',
          messageLoader: loadChangesetsMessages,
          messageParams: {
            element,
          },
          // The details go with the selection, and × takes both.
          statePredicate: (state) =>
            state.main.selection?.type !== 'changeset-element' ||
            state.main.selection.id !== id,
          onClose: selectFeature(null),
          style: 'info',
        }),
      );
    },
  };
