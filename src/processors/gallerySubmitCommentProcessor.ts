import {
  galleryRequestImage,
  gallerySubmitComment,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const gallerySubmitCommentProcessor: Processor = {
  actionCreator: gallerySubmitComment,
  errorKey: 'gallery.commentAddingError',
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const { id } = image;

    window.gtag('event', 'submitComment', {
      event_category: 'Gallery',
    });

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
