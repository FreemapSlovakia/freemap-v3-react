import { exportMap } from '../../export/model/actions.js';
import type { Processor } from '../../../middlewares/processorMiddleware.js';

export const exportMapProcessor: Processor<typeof exportMap> = {
  actionCreator: exportMap,
  errorKey: 'mapExport.exportError',
  id: 'mapExport.export',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "map-export-processor-handler" */
        './mapExportProcessorHandler.js'
      )
    ).default(...params),
};
