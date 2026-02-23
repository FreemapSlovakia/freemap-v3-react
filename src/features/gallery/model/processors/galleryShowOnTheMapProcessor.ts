import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { galleryShowOnTheMap } from '../actions.js';

export const galleryShowOnTheMapProcessor: Processor = {
  actionCreator: galleryShowOnTheMap,
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
  },
};
