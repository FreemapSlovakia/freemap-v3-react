import { galleryShowOnTheMap } from 'fm3/actions/galleryActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const galleryShowOnTheMapProcessor: Processor = {
  actionCreator: galleryShowOnTheMap,
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
  },
};
