import {
  galleryRequestImage,
  gallerySubmitStars,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const gallerySubmitStarsProcessor: Processor<typeof gallerySubmitStars> =
  {
    actionCreator: gallerySubmitStars,
    errorKey: 'gallery.ratingError',
    handle: async ({ getState, dispatch, action }) => {
      const { image } = getState().gallery;
      if (!image) {
        return;
      }

      const stars = action.payload;

      const { id } = image;

      window.gtag('event', 'submitStars', {
        event_category: 'Gallery',
        value: stars,
      });

      await httpRequest({
        getState,
        method: 'POST',
        url: `/gallery/pictures/${id}/rating`,
        data: { stars },
        expectedStatus: 204,
      });

      if (getState().gallery.activeImageId === id) {
        dispatch(galleryRequestImage(id));
      }
    },
  };
