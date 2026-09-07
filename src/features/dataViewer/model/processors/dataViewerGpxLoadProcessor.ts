import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerGpxLoad,
  dataViewerSetData,
} from '@features/dataViewer/model/actions.js';
import { parseDataBuffer } from '@features/dataViewer/parseDataFile.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';

export const dataViewerGpxLoadProcessor: Processor = {
  actionCreator: dataViewerGpxLoad,
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

      const trackGeojson = await parseDataBuffer(await res.arrayBuffer(), url);

      if (!trackGeojson) {
        // The fetch succeeded; the content just isn't a supported/usable track.
        dispatch(
          toastsAdd({
            messageKey: 'invalidFormat',
            messageLoader: loadDataViewerMessages,
            style: 'danger',
          }),
        );

        return;
      }

      dispatch(dataViewerSetData({ trackGeojson }));
    } catch (err) {
      await toastError(err, loadDataViewerMessages, 'fetchingError');
    }
  },
};
