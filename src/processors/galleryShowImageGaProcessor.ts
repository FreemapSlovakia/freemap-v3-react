import { gallerySetImage } from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const galleryShowImageGaProcessor: Processor = {
  actionCreator: gallerySetImage,
  async handle({ getState }) {
    const {
      gallery: { image },
    } = getState();

    if (image) {
      window.gtag('event', 'showPhoto' as any, {
        event_category: 'Gallery',
        value: image.id,
      });
    }
  },
};
