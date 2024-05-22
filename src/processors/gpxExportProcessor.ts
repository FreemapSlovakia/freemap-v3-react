import { exportMapFeatures } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const gpxExportProcessor: Processor<typeof exportMapFeatures> = {
  actionCreator: exportMapFeatures,
  errorKey: 'exportMapFeatures.exportError',
  id: 'gpxExport',
  handle: async (...params) => {
    return (
      params[0].action.payload.target === 'garmin'
        ? await import('../export/garminExportProcessorHandler')
        : params[0].action.payload.type === 'gpx'
          ? await import('../export/gpxExportProcessorHandler')
          : await import('../export/geojsonExportProcessorHandler')
    ).default(...params);
  },
};
