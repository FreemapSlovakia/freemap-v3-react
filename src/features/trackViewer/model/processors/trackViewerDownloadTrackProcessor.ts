import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerDownloadTrack,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { loadTrackViewerMessages } from '@features/trackViewer/translations/loadTrackViewerMessages.js';
import z from 'zod';

export const trackViewerDownloadTrackProcessor: Processor = {
  actionCreator: trackViewerDownloadTrack,
  handle: async ({ dispatch, getState, toastError }) => {
    const { trackUID } = getState().trackViewer;

    try {
      const res = await httpRequest({
        getState,
        url: `/tracklogs/${trackUID}`,
      });

      dispatch(
        trackViewerSetData({
          trackGpx: decodeURIComponent(
            escape(
              atob(z.object({ data: z.string() }).parse(await res.json()).data),
            ),
          ),
        }),
      );
    } catch (err) {
      await toastError(err, loadTrackViewerMessages, 'fetchingError');
    }
  },
};
