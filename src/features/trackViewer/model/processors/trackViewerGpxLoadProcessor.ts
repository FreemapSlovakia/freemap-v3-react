import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  trackViewerGpxLoad,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { loadTrackViewerMessages } from '@features/trackViewer/translations/loadTrackViewerMessages.js';

export const trackViewerGpxLoadProcessor: Processor = {
  actionCreator: trackViewerGpxLoad,
  handle: async ({ dispatch, getState }) => {
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

      dispatch(trackViewerSetData({ trackGpx: await res.text() }));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const tvm = await loadTrackViewerMessages(getState().l10n.language);

      dispatch(
        toastsAdd({ style: 'danger', message: tvm.fetchingError({ err }) }),
      );
    }
  },
};
