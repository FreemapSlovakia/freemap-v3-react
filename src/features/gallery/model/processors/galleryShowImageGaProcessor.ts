import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { gallerySetImage } from '../actions.js';

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
