import { galleryShowOnTheMap } from '../actions/galleryActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const galleryShowOnTheMapProcessor: Processor = {
  actionCreator: galleryShowOnTheMap,
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
  },
};
