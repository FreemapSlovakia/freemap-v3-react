import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import { galleryRequestImage, gallerySubmitComment } from '../actions.js';

export const gallerySubmitCommentProcessor: Processor = {
  actionCreator: gallerySubmitComment,
  async handle({ getState, dispatch, toastError }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const { id } = image;

    window._paq.push(['trackEvent', 'Gallery', 'submitComment']);

    try {
      await httpRequest({
        getState,
        method: 'POST',
        url: `/gallery/pictures/${id}/comments`,
        data: {
          comment: getState().gallery.comment,
          webBaseUrl: location.origin,
        },
        expectedStatus: 200,
      });
    } catch (err) {
      await toastError(err, loadGalleryMessages, 'commentAddingError');

      return;
    }

    if (getState().gallery.activeImageId === id) {
      dispatch(galleryRequestImage(id));
    }
  },
};
