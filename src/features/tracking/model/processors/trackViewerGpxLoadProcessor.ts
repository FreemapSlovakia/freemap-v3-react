import {
  trackViewerGpxLoad,
  trackViewerSetData,
} from '../../../trackViewer/model/actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';

export const trackViewerGpxLoadProcessor: Processor = {
  actionCreator: trackViewerGpxLoad,
  errorKey: 'trackViewer.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const url = getState().trackViewer.gpxUrl;

    if (!url) {
      return;
    }

    const res = await httpRequest({
      getState,
      url,
      expectedStatus: 200,
    });

    dispatch(trackViewerSetData({ trackGpx: await res.text() }));
  },
};
