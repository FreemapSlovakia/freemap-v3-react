import { selectionRenumbered } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { dataViewerDrawContinue, dataViewerDrawStart } from '../actions.js';

/**
 * Selects the feature being drawn, as the reducer placed it: starting can end
 * a drawing first and drop its line, which shifts the index the action named.
 * Not `selectFeature`, which would end this drawing too.
 */
export const dataViewerDrawSelectProcessor: Processor<
  typeof dataViewerDrawStart | typeof dataViewerDrawContinue
> = {
  actionCreator: [dataViewerDrawStart, dataViewerDrawContinue],
  handle: ({ getState, dispatch }) => {
    const { drawing } = getState().trackViewer;

    if (drawing) {
      dispatch(selectionRenumbered({ type: 'feature', id: drawing.index }));
    }
  },
};
