import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { galleryUpload } from '../actions.js';

export const galleryItemUploadProcessor: Processor = {
  actionCreator: galleryUpload,
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "gallery-item-upload-processor-handler" */
        './galleryItemUploadProcessorHandler.js'
      )
    ).default(...params),
};
