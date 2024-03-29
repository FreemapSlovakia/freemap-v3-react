import { galleryUpload } from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const galleryItemUploadProcessor: Processor = {
  actionCreator: galleryUpload,
  handle: async (...params) =>
    (await import('./galleryItemUploadProcessorHandler')).default(...params),
};
