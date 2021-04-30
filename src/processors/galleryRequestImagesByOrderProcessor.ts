import {
  galleryList,
  galleryRequestImage,
  gallerySetImageIds,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { createFilter } from 'fm3/galleryUtils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

export const galleryRequestImagesByOrderProcessor: Processor<
  typeof galleryList
> = {
  actionCreator: galleryList,
  errorKey: 'gallery.picturesFetchingError',
  async handle({ getState, dispatch, action }) {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/pictures',
      params: {
        by: 'order',
        orderBy: action.payload.substring(1),
        direction: action.payload[0] === '+' ? 'asc' : 'desc',
        ...createFilter(getState().gallery.filter),
      },
      expectedStatus: 200,
    });

    const ids = assertType<{ id: number }[]>(data).map((item) => item.id);

    dispatch(gallerySetImageIds(ids));

    if (ids[0] !== undefined) {
      dispatch(galleryRequestImage(ids[0]));
    }
  },
};
