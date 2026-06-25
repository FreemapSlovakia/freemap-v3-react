import type {
  Processor,
  ProcessorHandler,
} from '@app/store/middleware/processorMiddleware.js';
import { loadMapFeaturesExportMessages } from '../../translations/loadMapFeaturesExportMessages.js';
import { type ExportType, exportMapFeatures } from '../actions.js';

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
    const { toastError } = params[0];

    const { type, target, exportables } = params[0].action.payload;

    window._paq.push([
      'trackEvent',
      'FeaturesExport',
      'export',
      new URLSearchParams({
        type,
        target,
        exportables: [...exportables].sort().join(','),
      }).toString(),
    ]);

    try {
      const module =
        target === 'garmin'
          ? await import(
              /* webpackChunkName: "garmin-export-processor-handler" */
              './garminExportProcessorHandler.js'
            )
          : await formatHandlers[type]();

      return module.default(...params);
    } catch (err) {
      await toastError(err, loadMapFeaturesExportMessages, 'exportError');
    }
  },
};
