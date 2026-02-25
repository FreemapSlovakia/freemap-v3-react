import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { assert } from 'typia';
import { createFilter } from '../../galleryUtils.js';
import {
  galleryList,
  galleryRequestImage,
  gallerySetImageIds,
} from '../actions.js';

export const galleryRequestImagesByOrderProcessor: Processor<
  typeof galleryList
> = {
  actionCreator: galleryList,
  id: 'gallery.picturesFetchingError',
  errorKey: 'gallery.picturesFetchingError',
  async handle({ getState, dispatch, action }) {
    const res = await httpRequest({
      getState,
      url:
        '/gallery/pictures?' +
        objectToURLSearchParams({
          by: 'order',
          orderBy: action.payload.substring(1),
          direction: action.payload[0] === '+' ? 'asc' : 'desc',
          ...createFilter(getState().gallery.filter),
        }),
      expectedStatus: 200,
    });

    const ids = assert<{ id: number }[]>(await res.json()).map(
      (item) => item.id,
    );

    dispatch(gallerySetImageIds(ids));

    if (ids[0] !== undefined) {
      dispatch(galleryRequestImage(ids[0]));
    }
  },
};
