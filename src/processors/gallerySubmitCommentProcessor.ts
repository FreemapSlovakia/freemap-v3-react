import {
  galleryRequestImage,
  gallerySubmitComment,
} from '../actions/galleryActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const gallerySubmitCommentProcessor: Processor = {
  actionCreator: gallerySubmitComment,
  errorKey: 'gallery.commentAddingError',
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const { id } = image;

    window._paq.push(['trackEvent', 'Gallery', 'submitComment', String(id)]);

    await httpRequest({
      getState,
      method: 'POST',
      url: `/gallery/pictures/${id}/comments`,
      data: {
        comment: getState().gallery.comment,
        webBaseUrl: process.env['BASE_URL'],
      },
      expectedStatus: 200,
    });

    if (getState().gallery.activeImageId === id) {
      dispatch(galleryRequestImage(id));
    }
  },
};
