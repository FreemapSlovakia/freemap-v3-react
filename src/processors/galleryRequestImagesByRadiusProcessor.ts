import {
  galleryRequestImage,
  galleryRequestImages,
  gallerySetImageIds,
} from 'fm3/actions/galleryActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { createFilter } from 'fm3/galleryUtils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

export const galleryRequestImagesByRadiusProcessor: Processor<
  typeof galleryRequestImages
> = {
  actionCreator: galleryRequestImages,
  errorKey: 'gallery.picturesFetchingError',
  async handle({ getState, dispatch, action }) {
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
    } else {
      dispatch(
        toastsAdd({
          id: 'gallery.noPicturesFound',
          timeout: 5000,
          style: 'warning',
          messageKey: 'gallery.noPicturesFound',
          cancelType: [getType(galleryRequestImages)],
        }),
      );
    }
  },
};
