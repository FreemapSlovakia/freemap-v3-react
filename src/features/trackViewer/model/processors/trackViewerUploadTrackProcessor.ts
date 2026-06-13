import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  trackViewerSetTrackUID,
  trackViewerUploadTrack,
} from '@features/trackViewer/model/actions.js';
import { loadTrackViewerMessages } from '@features/trackViewer/translations/loadTrackViewerMessages.js';
import { Dispatch } from 'redux';
import z from 'zod';

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
      const tvm = await loadTrackViewerMessages(getState().l10n.language);

      dispatch(
        toastsAdd({
          id: 'trackViewer.tooBigError',
          message: tvm.tooBigError,
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
      trackViewerSetTrackUID(
        z.object({ uid: z.string() }).parse(await res.json()).uid,
      ),
    );
  }

  const tvm = await loadTrackViewerMessages(getState().l10n.language);

  dispatch(
    toastsAdd({
      message: tvm.shareToast,
      style: 'info',
      id: 'trackViewer.shareToast',
      timeout: 5000,
    }),
  );
}

export const trackViewerUploadTrackProcessor: Processor = {
  actionCreator: trackViewerUploadTrack,
  handle: async (params) => {
    const { toastError } = params;

    try {
      await handleTrackUpload(params);
    } catch (err) {
      await toastError(err, loadTrackViewerMessages, 'savingError');
    }
  },
};
