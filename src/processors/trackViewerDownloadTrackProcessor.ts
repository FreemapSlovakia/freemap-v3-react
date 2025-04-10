import { assert } from 'typia';
import {
  trackViewerDownloadTrack,
  trackViewerSetData,
} from '../actions/trackViewerActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const trackViewerDownloadTrackProcessor: Processor = {
  actionCreator: trackViewerDownloadTrack,
  errorKey: 'trackViewer.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { trackUID } = getState().trackViewer;

    const res = await httpRequest({
      getState,
      url: `/tracklogs/${trackUID}`,
    });

    dispatch(
      trackViewerSetData({
        trackGpx: decodeURIComponent(
          escape(atob(assert<{ data: string }>(await res.json()).data)),
        ),
      }),
    );
  },
};
