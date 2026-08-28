import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { dataViewerJoinTracks } from '../actions.js';

/**
 * Keeps the selection on the track the join produced: it sits where the armed
 * one was, minus the joined-in track when that came before it.
 */
export const dataViewerJoinTracksProcessor: Processor<
  typeof dataViewerJoinTracks
> = {
  actionCreator: dataViewerJoinTracks,
  handle: ({ prevState, getState, dispatch, action }) => {
    const target = prevState.trackViewer.joinWith?.featureIndex;

    // A join it could not make leaves the mode armed, so this is what says
    // whether the tracks were in fact joined.
    if (target === undefined || getState().trackViewer.joinWith) {
      return;
    }

    dispatch(
      selectFeature({
        type: 'data-viewer',
        id: target - (action.payload < target ? 1 : 0),
      }),
    );
  },
};
