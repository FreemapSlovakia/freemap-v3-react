import {
  trackViewerSetTrackUID,
  trackViewerUploadTrack,
} from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';
import { dispatchAxiosErrorAsToast } from './utils';

export const trackViewerUploadTrackProcessor: IProcessor = {
  actionCreator: trackViewerUploadTrack,
  handle: async ({ dispatch, getState }) => {
    const { trackGpx } = getState().trackViewer;
    if (!trackGpx) {
      return;
    }

    if (trackGpx.length > process.env.MAX_GPX_TRACK_SIZE_IN_MB * 1000000) {
      dispatch(
        toastsAdd({
          messageKey: 'trackViewer.tooBigError',
          messageParams: {
            maxSize: process.env.MAX_GPX_TRACK_SIZE_IN_MB,
          },
          style: 'danger',
        }),
      );
      return;
    }

    try {
      const { data } = await httpRequest({
        getState,
        method: 'POST',
        url: '/tracklogs',
        data: {
          data: btoa(unescape(encodeURIComponent(trackGpx))),
          mediaType: 'application/gpx+xml',
        },
        expectedStatus: 201,
      });

      dispatch(trackViewerSetTrackUID(assertType<{ uid: string }>(data).uid));
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'trackViewer.savingError', err);
    }
  },
};
