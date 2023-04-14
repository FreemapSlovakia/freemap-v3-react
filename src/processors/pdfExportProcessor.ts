import { exportPdf } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const exportPdfProcessor: Processor<typeof exportPdf> = {
  actionCreator: exportPdf,
  errorKey: 'pdfExport.exportError',
  id: 'pdfExport.export',
  handle: async (...params) =>
    (await import('./pdfExportProcessorHandler')).default(...params),
};
