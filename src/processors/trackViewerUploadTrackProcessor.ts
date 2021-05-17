import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  trackViewerSetTrackUID,
  trackViewerUploadTrack,
} from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { DefaultRootState } from 'react-redux';
import { Dispatch } from 'redux';
import { assertType } from 'typescript-is';

export async function handleTrackUpload({
  dispatch,
  getState,
}: {
  dispatch: Dispatch;
  getState(): DefaultRootState;
}): Promise<void> {
  const { trackGpx, trackUID } = getState().trackViewer;

  if (!trackGpx) {
    return;
  }

  if (!trackUID) {
    const maxSize = process.env['MAX_GPX_TRACK_SIZE_IN_MB']
      ? parseInt(process.env['MAX_GPX_TRACK_SIZE_IN_MB'], 10)
      : -1;

    if (trackGpx.length > maxSize * 1000000) {
      dispatch(
        toastsAdd({
          id: 'trackViewer.tooBigError',
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
  }

  dispatch(
    toastsAdd({
      messageKey: 'trackViewer.shareToast',
      style: 'info',
      id: 'trackViewer.shareToast',
      timeout: 5000,
    }),
  );
}

export const trackViewerUploadTrackProcessor: Processor = {
  actionCreator: trackViewerUploadTrack,
  errorKey: 'trackViewer.savingError',
  handle: handleTrackUpload,
};
