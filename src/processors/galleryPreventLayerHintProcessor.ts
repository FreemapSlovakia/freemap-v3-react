import storage from 'fm3/storage';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { galleryPreventLayerHint } from 'fm3/actions/galleryActions';

export const galleryPreventLayerHintProcessor: IProcessor = {
  actionCreator: galleryPreventLayerHint,
  handle: async () => {
    storage.setItem('galleryPreventLayerHint', '1');
  },
};
