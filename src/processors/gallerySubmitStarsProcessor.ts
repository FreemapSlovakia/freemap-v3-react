import {
  galleryRequestImage,
  gallerySubmitStars,
} from '../actions/galleryActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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

      window._paq.push([
        'trackEvent',
        'Gallery',
        'submitStars',
        String(id),
        stars,
      ]);

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
