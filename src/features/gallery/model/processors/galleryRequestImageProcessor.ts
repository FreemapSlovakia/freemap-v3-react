import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySetImage,
  PictureSchema,
} from '../actions.js';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  async handle({ getState, dispatch, toastError }) {
    const res = await httpRequest({
      getState,
      url: `/gallery/pictures/${getState().gallery.activeImageId}`,
      expectedStatus: 200,
    }).catch(async (err) => {
      await toastError(err, loadGalleryMessages, 'pictureFetchingError');

      return null;
    });

    if (!res) {
      return;
    }

    dispatch(gallerySetImage(PictureSchema.parse(await res.json())));
  },
};
