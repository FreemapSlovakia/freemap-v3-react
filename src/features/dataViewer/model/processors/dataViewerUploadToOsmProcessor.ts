import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetOsmGpxAuthorized } from '@features/auth/model/actions.js';
import {
  dataViewerCheckOsmAuthorization,
  dataViewerUploadToOsm,
  OSM_GPX_CHECK_PROGRESS_ID,
  OSM_GPX_UPLOAD_PROGRESS_ID,
} from '@features/dataViewer/model/actions.js';
import { isOsmTraceLine } from '@features/dataViewer/osmTrace.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import {
  startProgress,
  stopProgress,
} from '@features/progress/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import z from 'zod';

export const dataViewerCheckOsmAuthorizationProcessor: Processor<
  typeof dataViewerCheckOsmAuthorization
> = {
  actionCreator: dataViewerCheckOsmAuthorization,
  handle: async ({ dispatch, getState }) => {
    dispatch(startProgress(OSM_GPX_CHECK_PROGRESS_ID));

    try {
      const res = await httpRequest({
        getState,
        url: '/osm-gpx/authorization',
        expectedStatus: 200,
      });

      const { authorized } = z
        .object({ authorized: z.boolean().nullable() })
        .parse(await res.json());

      // `null`: OSM gave no clear answer, so the stored one stands.
      if (authorized !== null) {
        dispatch(authSetOsmGpxAuthorized(authorized));
      }
    } catch (err) {
      // Not knowing leaves the stored answer; the upload itself still checks.
      console.warn('OSM authorization check failed:', err);
    } finally {
      dispatch(stopProgress(OSM_GPX_CHECK_PROGRESS_ID));
    }
  },
};

export const dataViewerUploadToOsmProcessor: Processor<
  typeof dataViewerUploadToOsm
> = {
  actionCreator: dataViewerUploadToOsm,
  handle: async ({ dispatch, getState, action, toastError }) => {
    // Here, not at the modal's submit: only an authorization that succeeds
    // reaches the upload, and it is dispatched once.
    trackMatomo([
      'trackEvent',
      'TrackViewer',
      'uploadToOsm',
      action.payload.visibility,
    ]);

    dispatch(startProgress(OSM_GPX_UPLOAD_PROGRESS_ID));

    try {
      const { buildGpx } = await import(
        /* webpackChunkName: "gpx-export-processor-handler" */
        '@features/mapFeaturesExport/model/processors/gpxExportProcessorHandler.js'
      );

      const gpx = await buildGpx(getState, {
        exportables: ['import'],
        importFilter: isOsmTraceLine,
      });

      const res = await httpRequest({
        getState,
        method: 'POST',
        url: '/osm-gpx',
        data: { gpx, ...action.payload },
        expectedStatus: [200, 403],
      });

      if (res.status === 403) {
        // Revoked since the modal's check; the next Upload authorizes again.
        dispatch(authSetOsmGpxAuthorized(false));

        dispatch(
          toastsAdd({
            id: 'dataViewer.osmUpload',
            style: 'warning',
            messageKey: 'osmUpload.reauthorize',
            messageLoader: loadDataViewerMessages,
          }),
        );

        return;
      }

      const { url } = z.object({ url: z.url() }).parse(await res.json());

      dispatch(
        toastsAdd({
          id: 'dataViewer.osmUpload',
          style: 'success',
          timeout: 10000,
          messageKey: 'osmUpload.success',
          messageParams: { url },
          messageLoader: loadDataViewerMessages,
        }),
      );

      if (getState().main.activeModal?.type === 'track-viewer-osm-upload') {
        dispatch(setActiveModal(null));
      }
    } catch (err) {
      await toastError(err, loadDataViewerMessages, 'osmUploadError');
    } finally {
      dispatch(stopProgress(OSM_GPX_UPLOAD_PROGRESS_ID));
    }
  },
};
