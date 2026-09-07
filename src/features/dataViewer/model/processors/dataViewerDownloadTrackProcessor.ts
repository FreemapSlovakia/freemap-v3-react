import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerDownloadTrack,
  dataViewerSetData,
} from '@features/dataViewer/model/actions.js';
import { parseDataFile } from '@features/dataViewer/parseDataFile.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import z from 'zod';

export const dataViewerDownloadTrackProcessor: Processor = {
  actionCreator: dataViewerDownloadTrack,
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

      const trackGeojson = parseDataFile(gpx, `${trackUID}.gpx`);

      if (!trackGeojson) {
        // App-stored tracks are always valid GPX, so this is a safety net; a
        // parse failure here is a bad format, not a fetch failure.
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
