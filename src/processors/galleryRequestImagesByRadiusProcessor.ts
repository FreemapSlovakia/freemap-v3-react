import {
  galleryRequestImage,
  galleryRequestImages,
  gallerySetImageIds,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { createFilter } from 'fm3/galleryUtils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

export const galleryRequestImagesByRadiusProcessor: Processor<
  typeof galleryRequestImages
> = {
  actionCreator: galleryRequestImages,
  errorKey: 'gallery.picturesFetchingError',
  handle: async ({ getState, dispatch, action }) => {
    const { lat, lon } = action.payload;

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/pictures',
      params: {
        by: 'radius',
        lat,
        lon,
        distance: 5000 / 2 ** getState().map.zoom,
        ...createFilter(getState().gallery.filter),
      },
      expectedStatus: 200,
    });

    const ids = assertType<{ id: number }[]>(data).map((item) => item.id);

    dispatch(gallerySetImageIds(ids));

    if (ids.length) {
      dispatch(galleryRequestImage(ids[0]));
    }
  },
};
