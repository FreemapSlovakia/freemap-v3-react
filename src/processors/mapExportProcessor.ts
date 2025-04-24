import { exportMap } from '../actions/mainActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const exportMapProcessor: Processor<typeof exportMap> = {
  actionCreator: exportMap,
  errorKey: 'mapExport.exportError',
  id: 'mapExport.export',
  handle: async (...params) =>
    (await import('./mapExportProcessorHandler.js')).default(...params),
};
