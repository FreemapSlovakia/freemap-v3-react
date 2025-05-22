import { assert } from 'typia';
import {
  galleryRequestImage,
  gallerySetImage,
  type Picture,
} from '../actions/galleryActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { StringDates } from '../types/common.js';

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

    const data = assert<StringDates<Picture>>(await res.json());

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
