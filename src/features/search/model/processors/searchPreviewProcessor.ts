import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { searchUnselectResult } from '../actions.js';

/**
 * A previewed result is on the map because it is the one being looked at, so it
 * goes as soon as it stops being — the toolbar's ×, Escape, picking another
 * result, or selecting some other feature all take it off, and none of them has
 * to say so. Kept results are untouched: they were asked for.
 *
 * An element whose fetch is in flight is left alone. It is nothing but an id
 * until it lands, and it is the landing that selects it.
 */
export const searchPreviewProcessor: Processor = {
  handle: async ({ getState, dispatch }) => {
    const { previewId, selectedResults } = getState().search;

    if (
      !previewId ||
      selectedResults.find((result) => featureIdsEqual(result.id, previewId))
        ?.loading
    ) {
      return;
    }

    const { selection } = getState().main;

    if (
      !(
        selection?.type === 'search' && featureIdsEqual(selection.id, previewId)
      )
    ) {
      dispatch(searchUnselectResult(previewId));
    }
  },
};
