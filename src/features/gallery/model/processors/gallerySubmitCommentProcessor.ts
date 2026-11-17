import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { pictureIdToPath } from '../../pictureIdPath.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySetComment,
  gallerySubmitComment,
} from '../actions.js';

export const gallerySubmitCommentProcessor: Processor = {
  actionCreator: gallerySubmitComment,
  async handle({ getState, dispatch, toastError }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const { id } = image;

    const { comment } = getState().gallery;

    if (!comment.trim()) {
      return;
    }

    trackMatomo(['trackEvent', 'Gallery', 'submitComment']);

    // At once, so a second press finds nothing to post; back if it fails.
    dispatch(gallerySetComment(''));

    try {
      await httpRequest({
        getState,
        method: 'POST',
        url: `/gallery/pictures/${pictureIdToPath(id)}/comments`,
        data: { comment, webBaseUrl: location.origin },
        expectedStatus: 200,
      });
    } catch (err) {
      const { gallery } = getState();

      if (gallery.activeImageId === id && !gallery.comment) {
        dispatch(gallerySetComment(comment));
      }

      await toastError(err, loadGalleryMessages, 'commentAddingError');

      return;
    }

    if (getState().gallery.activeImageId === id) {
      dispatch(galleryRequestImage(id));
    }
  },
};
