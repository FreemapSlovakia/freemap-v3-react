import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { gallerySetImage } from '../actions.js';

export const galleryShowImageGaProcessor: Processor = {
  actionCreator: gallerySetImage,
  async handle({ getState }) {
    const {
      gallery: { image },
    } = getState();

    if (image) {
      trackMatomo(['trackEvent', 'Gallery', 'showPhoto']);
    }
  },
};
