import {
  trackViewerGpxLoad,
  trackViewerSetData,
} from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

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

    dispatch(
      trackViewerSetData({ trackGpx: assertType<string>(await res.json()) }),
    );
  },
};
