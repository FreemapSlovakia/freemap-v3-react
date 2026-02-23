import { galleryShowOnTheMap } from '../actions.js';
import { mapRefocus } from '../../../map/model/actions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';

export const galleryShowOnTheMapProcessor: Processor = {
  actionCreator: galleryShowOnTheMap,
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
  },
};
