import {
  galleryRequestImage,
  gallerySetImage,
  Picture,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { assertType } from 'typescript-is';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  errorKey: 'gallery.pictureFetchingError',
  async handle({ getState, dispatch }) {
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
