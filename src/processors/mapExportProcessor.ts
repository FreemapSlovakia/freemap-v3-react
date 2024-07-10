import { exportMap } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const exportMapProcessor: Processor<typeof exportMap> = {
  actionCreator: exportMap,
  errorKey: 'mapExport.exportError',
  id: 'mapExport.export',
  handle: async (...params) =>
    (await import('./mapExportProcessorHandler')).default(...params),
};
