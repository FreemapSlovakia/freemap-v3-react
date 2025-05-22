import { gallerySetImage } from '../actions/galleryActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const galleryShowImageGaProcessor: Processor = {
  actionCreator: gallerySetImage,
  async handle({ getState }) {
    const {
      gallery: { image },
    } = getState();

    if (image) {
      window._paq.push([
        'trackEvent',
        'Gallery',
        'showPhoto',
        image.id.toString(),
      ]);
    }
  },
};
