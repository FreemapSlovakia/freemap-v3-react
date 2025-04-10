import { Dispatch } from 'redux';
import { assert } from 'typia';
import { toastsAdd } from '../actions/toastsActions.js';
import {
  trackViewerSetTrackUID,
  trackViewerUploadTrack,
} from '../actions/trackViewerActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';
import { RootState } from '../store.js';

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

    window._paq.push(['trackEvent', 'TrackViewer', 'upload']);

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
