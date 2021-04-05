import {
  trackViewerDownloadTrack,
  trackViewerSetData,
} from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

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

    dispatch(
      trackViewerSetData({
        trackGpx: decodeURIComponent(
          escape(atob(assertType<{ data: string }>(data).data)),
        ),
      }),
    );
  },
};
