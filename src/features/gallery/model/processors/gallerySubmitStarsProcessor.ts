import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import { galleryRequestImage, gallerySubmitStars } from '../actions.js';

export const gallerySubmitStarsProcessor: Processor<typeof gallerySubmitStars> =
  {
    actionCreator: gallerySubmitStars,
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
        undefined,
        stars,
      ]);

      try {
        await httpRequest({
          getState,
          method: 'POST',
          url: `/gallery/pictures/${id}/rating`,
          data: { stars },
          expectedStatus: 204,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        const gm = await loadGalleryMessages(getState().l10n.language);

        dispatch(
          toastsAdd({ style: 'danger', message: gm.ratingError({ err }) }),
        );

        return;
      }

      if (getState().gallery.activeImageId === id) {
        dispatch(galleryRequestImage(id));
      }
    },
  };
