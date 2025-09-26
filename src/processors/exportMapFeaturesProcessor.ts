import { exportMapFeatures } from '../actions/mainActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const exportMapFeaturesProcessor: Processor<typeof exportMapFeatures> = {
  actionCreator: exportMapFeatures,
  errorKey: 'exportMapFeatures.exportError',
  id: 'mapFeaturesExport',
  handle: async (...params) => {
    return (
      params[0].action.payload.target === 'garmin'
        ? await import(
            /* webpackChunkName: "garmin-export-processor-handler" */
            '../export/garminExportProcessorHandler.js'
          )
        : params[0].action.payload.type === 'gpx'
          ? await import(
              /* webpackChunkName: "gpx-export-processor-handler" */
              '../export/gpxExportProcessorHandler.js'
            )
          : await import(
              /* webpackChunkName: "geojson-export-processor-handler" */
              '../export/geojsonExportProcessorHandler.js'
            )
    ).default(...params);
  },
};
