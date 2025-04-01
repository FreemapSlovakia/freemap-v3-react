import {
  galleryRequestImage,
  galleryRequestImages,
  gallerySetImageIds,
} from 'fm3/actions/galleryActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { createFilter } from 'fm3/galleryUtils';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { objectToURLSearchParams } from 'fm3/stringUtils';
import { assert } from 'typia';

export const galleryRequestImagesByRadiusProcessor: Processor<
  typeof galleryRequestImages
> = {
  actionCreator: galleryRequestImages,
  id: 'gallery.picturesFetchingError',
  errorKey: 'gallery.picturesFetchingError',
  async handle({ getState, dispatch, action }) {
    const { lat, lon } = action.payload;

    const res = await httpRequest({
      getState,
      url:
        '/gallery/pictures?' +
        objectToURLSearchParams({
          by: 'radius',
          lat,
          lon,
          distance: 5000 / 2 ** getState().map.zoom,
          ...createFilter(getState().gallery.filter),
        }),
      expectedStatus: 200,
    });

    const ids = assert<{ id: number }[]>(await res.json()).map(
      (item) => item.id,
    );

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
          cancelType: [galleryRequestImages.type],
        }),
      );
    }
  },
};
