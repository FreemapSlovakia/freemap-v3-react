import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  trackViewerGpxLoad,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { parseTrackFile } from '@features/trackViewer/parseTrackFile.js';
import { loadTrackViewerMessages } from '@features/trackViewer/translations/loadTrackViewerMessages.js';

export const trackViewerGpxLoadProcessor: Processor = {
  actionCreator: trackViewerGpxLoad,
  handle: async ({ dispatch, getState, toastError }) => {
    const url = getState().trackViewer.gpxUrl;

    if (!url) {
      return;
    }

    try {
      const res = await httpRequest({
        getState,
        url,
        expectedStatus: 200,
      });

      const trackGeojson = parseTrackFile(await res.text(), url);

      if (!trackGeojson) {
        // The fetch succeeded; the content just isn't a supported/usable track.
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
