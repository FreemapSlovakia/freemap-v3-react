import { galleryUpload } from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const galleryItemUploadProcessor: Processor = {
  actionCreator: galleryUpload,
  async handle(...params) {
    (
      await import(
        /* webpackChunkName: "galleryItemUploadProcessorHandler" */ './galleryItemUploadProcessorHandler'
      )
    ).default(...params);
  },
};
