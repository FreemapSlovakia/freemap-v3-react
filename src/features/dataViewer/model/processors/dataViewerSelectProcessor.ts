import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isTrackLine } from '../../trackSelection.js';
import { dataViewerSetActiveTrack } from '../actions.js';

/**
 * Aims the chart / "more info" / matching at a selected line, wherever the
 * selection came from. Selecting a point or polygon leaves the active line
 * alone — there is no profile to move to.
 */
export const dataViewerSelectProcessor: Processor<typeof selectFeature> = {
  actionCreator: selectFeature,
  handle: ({ getState, dispatch, action }) => {
    const selection = action.payload;

    if (selection?.type !== 'data-viewer') {
      return;
    }

    const state = getState();

    const feature = state.trackViewer.trackGeojson?.features[selection.id];

    if (
      feature &&
      isTrackLine(feature) &&
      state.trackViewer.activeTrackIndex !== selection.id
    ) {
      dispatch(dataViewerSetActiveTrack(selection.id));
    }
  },
};
