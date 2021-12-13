import {
  galleryRequestImage,
  gallerySetImage,
  Picture,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { assertType } from 'typescript-is';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  errorKey: 'gallery.pictureFetchingError',
  async handle({ getState, dispatch }) {
    const res = await httpRequest({
      getState,
      url: `/gallery/pictures/${getState().gallery.activeImageId}`,
      expectedStatus: 200,
    });

    const data = assertType<StringDates<Picture>>(await res.json());

    dispatch(
      gallerySetImage({
        ...data,
        createdAt: new Date(data.createdAt),
        takenAt: data.takenAt === null ? null : new Date(data.takenAt),
        comments: data.comments.map((comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        })),
      }),
    );
  },
};
