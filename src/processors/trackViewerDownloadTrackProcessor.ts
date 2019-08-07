import {
  trackViewerSetData,
  trackViewerDownloadTrack,
} from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { dispatchAxiosErrorAsToast } from './utils';

export const trackViewerDownloadTrackProcessor: IProcessor = {
  actionCreator: trackViewerDownloadTrack,
  handle: async ({ dispatch, getState }) => {
    const { trackUID } = getState().trackViewer;

    try {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: `/tracklogs/${trackUID}`,
      });

      if (data.error) {
        // TODO ???
        dispatch(
          toastsAdd({
            messageKey: 'trackViewer.fetchingError',
            messageParams: {
              err: data.error.toString(),
            },
          }),
        );
      } else {
        const trackGpx = atob(data.data);
        dispatch(trackViewerSetData({ trackGpx }));
      }
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'trackViewer.fetchingError', err);
    }
  },
};
