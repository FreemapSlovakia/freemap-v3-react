import { gallerySetImage } from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';

export const galleryShowImageGaProcessor: IProcessor = {
  actionCreator: gallerySetImage,
  handle: async ({ getState }) => {
    const {
      gallery: { image },
    } = getState();

    if (image) {
      window.ga('send', 'event', 'Gallery', 'showPhoto', image.id);
    }
  },
};
