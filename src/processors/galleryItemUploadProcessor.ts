import { galleryUpload } from '../actions/galleryActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const galleryItemUploadProcessor: Processor = {
  actionCreator: galleryUpload,
  handle: async (...params) =>
    (await import('./galleryItemUploadProcessorHandler.js')).default(...params),
};
