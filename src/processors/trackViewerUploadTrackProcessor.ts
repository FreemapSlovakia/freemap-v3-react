import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  trackViewerSetTrackUID,
  trackViewerUploadTrack,
} from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { RootState } from 'fm3/reducers';
import { Dispatch } from 'redux';
import { assert } from 'typia';

export async function handleTrackUpload({
  dispatch,
  getState,
}: {
  dispatch: Dispatch;
  getState: () => RootState;
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

    const res = await httpRequest({
      getState,
      method: 'POST',
      url: '/tracklogs',
      data: {
        data: btoa(unescape(encodeURIComponent(trackGpx))),
        mediaType: 'application/gpx+xml',
      },
      expectedStatus: 201,
    });

    dispatch(
      trackViewerSetTrackUID(assert<{ uid: string }>(await res.json()).uid),
    );
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
