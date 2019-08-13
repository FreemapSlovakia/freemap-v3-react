import {
  galleryRequestImage,
  gallerySubmitStars,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const gallerySubmitStarsProcessor: IProcessor<
  typeof gallerySubmitStars
> = {
  actionCreator: gallerySubmitStars,
  errorKey: 'gallery.ratingError',
  handle: async ({ getState, dispatch, action }) => {
    const { image } = getState().gallery;
    if (!image) {
      return;
    }

    const stars = action.payload;
    const { id } = image;

    window.ga('send', 'event', 'Gallery', 'submitStars', stars);

    await httpRequest({
      getState,
      method: 'POST',
      url: `/gallery/pictures/${id}/rating`,
      data: { stars },
      expectedStatus: 204,
    });

    dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
  },
};
