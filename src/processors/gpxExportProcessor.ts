import { exportGpx } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const gpxExportProcessor: Processor<typeof exportGpx> = {
  actionCreator: exportGpx,
  errorKey: 'gpxExport.exportError',
  id: 'gpxExport',
  handle: async (...params) => {
    (
      await import(
        /* webpackChunkName: "gpxExportProcessorHandler" */ './gpxExportProcessorHandler'
      )
    ).default(...params);
  },
};
