import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { exportMap } from '@features/export/model/actions.js';

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
