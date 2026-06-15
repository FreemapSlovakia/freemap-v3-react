import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { loadMapFeaturesExportMessages } from '../../translations/loadMapFeaturesExportMessages.js';
import { exportMapFeatures } from '../actions.js';

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
      return (
        target === 'garmin'
          ? await import(
              /* webpackChunkName: "garmin-export-processor-handler" */
              './garminExportProcessorHandler.js'
            )
          : type === 'gpx'
            ? await import(
                /* webpackChunkName: "gpx-export-processor-handler" */
                './gpxExportProcessorHandler.js'
              )
            : await import(
                /* webpackChunkName: "geojson-export-processor-handler" */
                './geojsonExportProcessorHandler.js'
              )
      ).default(...params);
    } catch (err) {
      await toastError(err, loadMapFeaturesExportMessages, 'exportError');
    }
  },
};
