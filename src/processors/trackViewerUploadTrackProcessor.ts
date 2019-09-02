import {
  trackViewerSetTrackUID,
  trackViewerUploadTrack,
} from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';

export const trackViewerUploadTrackProcessor: IProcessor = {
  actionCreator: trackViewerUploadTrack,
  errorKey: 'trackViewer.savingError',
  handle: async ({ dispatch, getState }) => {
    const { trackGpx } = getState().trackViewer;
    if (!trackGpx) {
      return;
    }

    const maxSize = process.env.MAX_GPX_TRACK_SIZE_IN_MB
      ? parseInt(process.env.MAX_GPX_TRACK_SIZE_IN_MB, 10)
      : -1;

    if (trackGpx.length > maxSize * 1000000) {
      dispatch(
        toastsAdd({
          messageKey: 'trackViewer.tooBigError',
          messageParams: {
            maxSize,
          },
          style: 'danger',
        }),
      );

      return;
    }

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
  },
};
