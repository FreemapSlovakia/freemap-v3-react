import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { exportMapFeatures } from '../actions.js';

export const exportMapFeaturesProcessor: Processor<typeof exportMapFeatures> = {
  actionCreator: exportMapFeatures,
  errorKey: 'exportMapFeatures.exportError',
  id: 'mapFeaturesExport',
  handle: async (...params) => {
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

    return (
      params[0].action.payload.target === 'garmin'
        ? await import(
            /* webpackChunkName: "garmin-export-processor-handler" */
            './garminExportProcessorHandler.js'
          )
        : params[0].action.payload.type === 'gpx'
          ? await import(
              /* webpackChunkName: "gpx-export-processor-handler" */
              './gpxExportProcessorHandler.js'
            )
          : await import(
              /* webpackChunkName: "geojson-export-processor-handler" */
              './geojsonExportProcessorHandler.js'
            )
    ).default(...params);
  },
};
