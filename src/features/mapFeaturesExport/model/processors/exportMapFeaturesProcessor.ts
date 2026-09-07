import { reportError } from '@app/store/middleware/globalErrorHandler.js';
import type {
  Processor,
  ProcessorHandler,
} from '@app/store/middleware/processorMiddleware.js';
import {
  startProgress,
  stopProgress,
} from '@features/progress/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadMapFeaturesExportMessages } from '../../translations/loadMapFeaturesExportMessages.js';
import {
  EXPORT_PROGRESS_ID,
  type ExportType,
  exportMapFeatures,
} from '../actions.js';

type HandlerModule = { default: ProcessorHandler<typeof exportMapFeatures> };

// One lazily-loaded handler chunk per format. Typed as a full record so adding
// a member to ExportTypeSchema without a handler is a compile error (rather
// than silently falling through to a default branch).
const formatHandlers: Record<ExportType, () => Promise<HandlerModule>> = {
  gpx: () =>
    import(
      /* webpackChunkName: "gpx-export-processor-handler" */
      './gpxExportProcessorHandler.js'
    ),
  geojson: () =>
    import(
      /* webpackChunkName: "geojson-export-processor-handler" */
      './geojsonExportProcessorHandler.js'
    ),
  kml: () =>
    import(
      /* webpackChunkName: "kml-export-processor-handler" */
      './kmlExportProcessorHandler.js'
    ),
};

export const exportMapFeaturesProcessor: Processor<typeof exportMapFeatures> = {
  actionCreator: exportMapFeatures,
  id: 'mapFeaturesExport',
  handle: async (...params) => {
    const { toastError, dispatch } = params[0];

    const { type, target, exportables } = params[0].action.payload;

    trackMatomo([
      'trackEvent',
      'FeaturesExport',
      'export',
      new URLSearchParams({
        type,
        target,
        exportables: [...exportables].sort().join(','),
      }).toString(),
    ]);

    dispatch(startProgress(EXPORT_PROGRESS_ID));

    // A handler chunk that won't load — offline, or hashes from a past deploy —
    // is the app failing to deliver itself rather than an export fault, and
    // reporting it would add a ticket-id toast to a plain "reload me".
    let loaded = false;

    try {
      const module =
        target === 'garmin'
          ? await import(
              /* webpackChunkName: "garmin-export-processor-handler" */
              './garminExportProcessorHandler.js'
            )
          : await formatHandlers[type]();

      loaded = true;

      return await module.default(...params);
    } catch (err) {
      // `toastError` replaces the middleware's generic processor toast with the
      // export's own, so the reporting the middleware would have done is done
      // here — reporting only, so the failure gets one toast rather than the
      // export's plus a ticket-id one. A cancelled export is not a failure.
      if (loaded && !isAbortError(err)) {
        reportError({
          kind: 'processor',
          error: err,
          action: params[0].action,
        });
      }

      await toastError(err, loadMapFeaturesExportMessages, 'exportError');
    } finally {
      dispatch(stopProgress(EXPORT_PROGRESS_ID));
    }
  },
};
