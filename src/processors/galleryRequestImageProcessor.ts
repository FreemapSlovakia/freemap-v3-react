import {
  gallerySetImage,
  galleryRequestImage,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const galleryRequestImageProcessor: IProcessor<
  typeof galleryRequestImage
> = {
  actionCreator: galleryRequestImage,
  errorKey: 'gallery.pictureFetchingError',
  handle: async ({ getState, dispatch, action }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `/gallery/pictures/${action.payload}`,
      expectedStatus: 200,
    });

    dispatch(
      gallerySetImage({
        ...data,
        createdAt: new Date(data.createdAt),
        takenAt: data.takenAt && new Date(data.takenAt),
        comments: data.comments.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        })),
      }),
    );
  },
};
