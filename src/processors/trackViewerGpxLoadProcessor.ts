import {
  trackViewerSetData,
  trackViewerGpxLoad,
} from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

export const trackViewerGpxLoadProcessor: IProcessor = {
  actionCreator: trackViewerGpxLoad,
  errorKey: 'trackViewer.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const url = getState().trackViewer.gpxUrl;
    if (!url) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url,
      expectedStatus: 200,
    });

    dispatch(trackViewerSetData({ trackGpx: assertType<string>(data) }));
  },
};
