import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';

/** A feature selection whose feature is no longer there. */
function staleSelection(state: RootState): boolean {
  const { selection } = state.main;

  return (
    (selection?.type === 'feature' || selection?.type === 'vertex') &&
    !state.trackViewer.trackGeojson?.features[selection.id]
  );
}

/**
 * Lets go of a selection whose feature went without anyone selecting anew — a
 * drawing that ended with too few points to be a line is the usual one.
 */
export const dataViewerStaleSelectionProcessor: Processor = {
  stateChangePredicate: (state) => state.trackViewer.trackGeojson,
  statePredicate: staleSelection,
  handle: ({ dispatch }) => {
    dispatch(selectFeature(null));
  },
};
