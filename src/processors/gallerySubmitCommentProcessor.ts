import {
  galleryRequestImage,
  gallerySubmitComment,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const gallerySubmitCommentProcessor: IProcessor = {
  actionCreator: gallerySubmitComment,
  errorKey: 'gallery.commentAddingError',
  handle: async ({ getState, dispatch }) => {
    const { image } = getState().gallery;
    if (!image) {
      return;
    }

    const { id } = image;

    window.ga('send', 'event', 'Gallery', 'submitComment');

    await httpRequest({
      getState,
      method: 'POST',
      url: `/gallery/pictures/${id}/comments`,
      data: {
        comment: getState().gallery.comment,
      },
      expectedStatus: 200,
    });

    dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
  },
};
