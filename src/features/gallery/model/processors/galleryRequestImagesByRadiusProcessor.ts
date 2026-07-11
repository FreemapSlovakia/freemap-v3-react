import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { createFilter } from '../../galleryUtils.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  galleryRequestImages,
  gallerySetImageIds,
} from '../actions.js';

export const galleryRequestImagesByRadiusProcessor: Processor<
  typeof galleryRequestImages
> = {
  actionCreator: galleryRequestImages,
  async handle({ getState, dispatch, action, toastError }) {
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
    }).catch(async (err) => {
      await toastError(
        err,
        loadGalleryMessages,
        'picturesFetchingError',
        'gallery.picturesFetchingError',
      );

      return null;
    });

    if (!res) {
      return;
    }

    const ids = z
      .array(z.object({ id: z.number(), source: z.number().default(0) }))
      .parse(await res.json())
      // Wikimedia photos (source 1) ride the shared id space as `-pageId`.
      .map((item) => (item.source === 1 ? -item.id : item.id));

    dispatch(gallerySetImageIds(ids));

    if (ids.length) {
      dispatch(galleryRequestImage(ids[0]));
    } else {
      dispatch(
        toastsAdd({
          id: 'gallery.noPicturesFound',
          timeout: 5000,
          style: 'warning',
          messageKey: 'noPicturesFound',
          messageLoader: loadGalleryMessages,
          cancelType: [galleryRequestImages.type],
        }),
      );
    }
  },
};
