import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySetImage,
  PictureSchema,
} from '../actions.js';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  async handle({ getState, dispatch }) {
    let res;

    try {
      res = await httpRequest({
        getState,
        url: `/gallery/pictures/${getState().gallery.activeImageId}`,
        expectedStatus: 200,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const gm = await loadGalleryMessages(getState().l10n.language);

      dispatch(
        toastsAdd({
          style: 'danger',
          message: gm.pictureFetchingError({ err }),
        }),
      );

      return;
    }

    dispatch(gallerySetImage(PictureSchema.parse(await res.json())));
  },
};
