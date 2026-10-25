import { selectionRenumbered } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { dataViewerExplodeTrack, dataViewerSplitTrack } from '../actions.js';

/**
 * Keeps the selection on its feature across a split or an explode: a later one
 * moves down by the features added; the cut one is selected as its first piece.
 */
export const dataViewerSplitSelectionProcessor: Processor<
  typeof dataViewerSplitTrack | typeof dataViewerExplodeTrack
> = {
  actionCreator: [dataViewerSplitTrack, dataViewerExplodeTrack],
  handle: ({ prevState, getState, dispatch, action }) => {
    const index = dataViewerSplitTrack.match(action)
      ? action.payload.featureIndex
      : action.payload;

    const count = (features: unknown[] | undefined) => features?.length ?? 0;

    // Nothing was cut where the count stands still.
    const added =
      count(getState().trackViewer.trackGeojson?.features) -
      count(prevState.trackViewer.trackGeojson?.features);

    const { selection } = getState().main;

    if (
      added <= 0 ||
      (selection?.type !== 'feature' && selection?.type !== 'vertex') ||
      selection.id < index
    ) {
      return;
    }

    dispatch(
      selectionRenumbered(
        selection.id > index
          ? { ...selection, id: selection.id + added }
          : { type: 'feature', id: index },
      ),
    );
  },
};
