import { galleryUpload } from '../actions/galleryActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
