import {
  gallerySetImage,
  galleryRequestImage,
} from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  errorKey: 'gallery.pictureFetchingError',
  handle: async ({ getState, dispatch }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `/gallery/pictures/${getState().gallery.activeImageId}`,
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
