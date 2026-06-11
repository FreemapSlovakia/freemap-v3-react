import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryClear,
  galleryDeletePicture,
  galleryRequestImage,
  gallerySetImageIds,
  gallerySetLayerDirty,
} from '../actions.js';

export const galleryDeletePictureProcessor: Processor = {
  actionCreator: galleryDeletePicture,
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    window._paq.push(['trackEvent', 'Gallery', 'deletePhoto']);

    const { id } = image;

    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/gallery/pictures/${id}`,
        expectedStatus: 204,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const gm = await loadGalleryMessages(getState().l10n.language);

      dispatch(
        toastsAdd({ style: 'danger', message: gm.deletingError({ err }) }),
      );

      return;
    }

    dispatch(gallerySetLayerDirty());

    const { imageIds, activeImageId } = getState().gallery;

    if (imageIds && activeImageId) {
      const idx = imageIds.findIndex((imgId) => imgId === activeImageId);

      if (idx !== -1) {
        const newImageIds = imageIds.filter((imgId) => imgId !== activeImageId);

        dispatch(gallerySetImageIds(newImageIds));

        if (!newImageIds.length) {
          dispatch(galleryClear());
        } else {
          const newActiveImageId =
            newImageIds.length > idx ? newImageIds[idx] : newImageIds.at(-1)!;

          dispatch(galleryRequestImage(newActiveImageId));
        }
      }
    } else if (activeImageId === id) {
      dispatch(galleryClear());
    }
  },
};
