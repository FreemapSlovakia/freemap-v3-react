import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { pictureIdToPath } from '../../pictureIdPath.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import { galleryRequestImage, gallerySubmitStars } from '../actions.js';

export const gallerySubmitStarsProcessor: Processor<typeof gallerySubmitStars> =
  {
    actionCreator: gallerySubmitStars,
    handle: async ({ getState, dispatch, action, toastError }) => {
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
        undefined,
        stars,
      ]);

      try {
        await httpRequest({
          getState,
          method: 'POST',
          url: `/gallery/pictures/${pictureIdToPath(id)}/rating`,
          data: { stars },
          expectedStatus: 204,
        });
      } catch (err) {
        await toastError(err, loadGalleryMessages, 'ratingError');

        return;
      }

      if (getState().gallery.activeImageId === id) {
        dispatch(galleryRequestImage(id));
      }
    },
  };
