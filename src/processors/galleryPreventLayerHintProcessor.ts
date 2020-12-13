import { galleryPreventLayerHint } from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { storage } from 'fm3/storage';

export const galleryPreventLayerHintProcessor: Processor = {
  actionCreator: galleryPreventLayerHint,
  handle: async () => {
    storage.setItem('galleryPreventLayerHint', '1');
  },
};
