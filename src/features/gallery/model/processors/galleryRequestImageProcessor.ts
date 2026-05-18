import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  galleryRequestImage,
  gallerySetImage,
  PictureSchema,
} from '../actions.js';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  errorKey: 'gallery.pictureFetchingError',
  async handle({ getState, dispatch }) {
    const res = await httpRequest({
      getState,
      url: `/gallery/pictures/${getState().gallery.activeImageId}`,
      expectedStatus: 200,
    });

    dispatch(gallerySetImage(PictureSchema.parse(await res.json())));
  },
};
