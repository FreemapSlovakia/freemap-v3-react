import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerGpxLoad,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { loadTrackViewerMessages } from '@features/trackViewer/translations/loadTrackViewerMessages.js';

export const trackViewerGpxLoadProcessor: Processor = {
  actionCreator: trackViewerGpxLoad,
  handle: async ({ dispatch, getState, toastError }) => {
    const url = getState().trackViewer.gpxUrl;

    if (!url) {
      return;
    }

    try {
      const res = await httpRequest({
        getState,
        url,
        expectedStatus: 200,
      });

      dispatch(trackViewerSetData({ trackGpx: await res.text() }));
    } catch (err) {
      await toastError(err, loadTrackViewerMessages, 'fetchingError');
    }
  },
};
