import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  trackViewerDownloadTrack,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { parseTrackFile } from '@features/trackViewer/parseTrackFile.js';
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

      const gpx = decodeURIComponent(
        escape(
          atob(z.object({ data: z.string() }).parse(await res.json()).data),
        ),
      );

      const trackGeojson = parseTrackFile(gpx, `${trackUID}.gpx`);

      if (!trackGeojson) {
        // App-stored tracks are always valid GPX, so this is a safety net; a
        // parse failure here is a bad format, not a fetch failure.
        dispatch(
          toastsAdd({
            messageKey: 'invalidFormat',
            messageLoader: loadTrackViewerMessages,
            style: 'danger',
          }),
        );

        return;
      }

      dispatch(trackViewerSetData({ trackGeojson }));
    } catch (err) {
      await toastError(err, loadTrackViewerMessages, 'fetchingError');
    }
  },
};
