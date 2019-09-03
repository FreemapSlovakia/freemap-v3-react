import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { galleryShowOnTheMap } from 'fm3/actions/galleryActions';

export const galleryShowOnTheMapProcessor: Processor = {
  actionCreator: galleryShowOnTheMap,
  handle: async ({ getState, dispatch }) => {
    const { image } = getState().gallery;
    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
  },
};
