import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { assert } from 'typia';
import { createFilter } from '../../galleryUtils.js';
import {
  galleryRequestImage,
  galleryRequestImages,
  gallerySetImageIds,
} from '../actions.js';

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
