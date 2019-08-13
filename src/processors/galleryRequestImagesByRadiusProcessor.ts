import {
  gallerySetImageIds,
  galleryRequestImage,
  galleryRequestImages,
} from 'fm3/actions/galleryActions';
import { createFilter } from 'fm3/galleryUtils';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const galleryRequestImagesByRadiusProcessor: IProcessor<
  typeof galleryRequestImages
> = {
  actionCreator: galleryRequestImages,
  errorKey: 'gallery.picturesFetchingError',
  handle: async ({ getState, dispatch, action }) => {
    const { lat, lon } = action.payload;

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      params: {
        by: 'radius',
        lat,
        lon,
        distance: 5000 / 2 ** getState().map.zoom,
        ...createFilter(getState().gallery.filter),
      },
      expectedStatus: 200,
    });

    const ids = data.map(item => item.id);
    dispatch(gallerySetImageIds(ids));
    if (ids.length) {
      dispatch(galleryRequestImage(ids[0]));
    }
  },
};
