import {
  galleryList,
  galleryRequestImage,
  gallerySetImageIds,
} from 'fm3/actions/galleryActions';
import { createFilter } from 'fm3/galleryUtils';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { objectToURLSearchParams } from 'fm3/stringUtils';
import { assert } from 'typia';

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
