import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import { toastsRemove } from '@features/toasts/model/actions.js';
import { resolveActiveTrack } from '../../trackSelection.js';
import { dataViewerDeleteFeature } from '../actions.js';
import { TRACK_INFO_TOAST_ID } from '../trackInfoToast.js';

/**
 * Takes the chart and the info panel down with the line they were of. The
 * active index falls back to the first line once the one it named is gone, so
 * without this they would silently redraw as another track's.
 */
export const dataViewerDeleteFeatureProcessor: Processor<
  typeof dataViewerDeleteFeature
> = {
  actionCreator: dataViewerDeleteFeature,
  handle: ({ prevState, dispatch, action }) => {
    const { trackGeojson, activeTrackIndex } = prevState.trackViewer;

    if (
      resolveActiveTrack(trackGeojson, activeTrackIndex)?.index !==
      action.payload
    ) {
      return;
    }

    if (prevState.elevationChart.target?.type === 'track-viewer') {
      dispatch(elevationChartClose());
    }

    if (TRACK_INFO_TOAST_ID in prevState.toasts.toasts) {
      dispatch(toastsRemove(TRACK_INFO_TOAST_ID));
    }
  },
};
