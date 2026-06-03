import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { exportMapToDocument } from '../actions.js';

export const mapToDocumentExportProcessor: Processor<
  typeof exportMapToDocument
> = {
  actionCreator: exportMapToDocument,
  errorKey: 'mapToDocumentExport.exportError',
  id: 'mapToDocumentExport.export',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "map-to-document-export-processor-handler" */
        './mapToDocumentExportProcessorHandler.js'
      )
    ).default(...params),
};
