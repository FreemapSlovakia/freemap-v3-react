import {
  trackViewerSetData,
  trackViewerGpxLoad,
} from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { dispatchAxiosErrorAsToast } from './utils';
import { assertType } from 'typescript-is';

export const trackViewerGpxLoadProcessor: IProcessor = {
  actionCreator: trackViewerGpxLoad,
  handle: async ({ dispatch, getState }) => {
    const url = getState().trackViewer.gpxUrl;
    if (!url) {
      return;
    }

    try {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url,
        expectedStatus: 200,
      });

      dispatch(trackViewerSetData({ trackGpx: assertType<string>(data) }));
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'trackViewer.fetchingError', err);
    }
  },
};
