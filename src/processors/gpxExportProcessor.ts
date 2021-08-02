import { exportGpx } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const gpxExportProcessor: Processor<typeof exportGpx> = {
  actionCreator: exportGpx,
  errorKey: 'gpxExport.exportError',
  id: 'gpxExport',
  handle: async (...params) => {
    (params[0].action.payload.type === 'gpx'
      ? await import('../export/gpxExportProcessorHandler')
      : await import('../export/geojsonExportProcessorHandler')
    ).default(...params);
  },
};
