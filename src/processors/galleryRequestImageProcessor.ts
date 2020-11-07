import {
  gallerySetImage,
  galleryRequestImage,
  Picture,
} from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';
import { StringDates } from 'fm3/types/common';

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

    const okData = assertType<StringDates<Picture>>(data);

    dispatch(
      gallerySetImage({
        ...okData,
        createdAt: new Date(okData.createdAt),
        takenAt: okData.takenAt === null ? null : new Date(okData.takenAt),
        comments: okData.comments.map((comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        })),
      }),
    );
  },
};
