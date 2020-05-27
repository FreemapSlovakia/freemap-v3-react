import {
  trackViewerSetData,
  trackViewerDownloadTrack,
} from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const trackViewerDownloadTrackProcessor: Processor = {
  actionCreator: trackViewerDownloadTrack,
  errorKey: 'trackViewer.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { trackUID } = getState().trackViewer;

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `/tracklogs/${trackUID}`,
    });

    if (data.error) {
      // TODO ???
      dispatch(
        toastsAdd({
          id: 'trackViewer.fetchingError',
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
  },
};
