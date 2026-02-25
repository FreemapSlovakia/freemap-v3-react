import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerDownloadTrack,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { assert } from 'typia';

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
