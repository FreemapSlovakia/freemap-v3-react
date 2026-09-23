import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
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
  async handle({ getState, dispatch, toastError }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    trackMatomo(['trackEvent', 'Gallery', 'deletePhoto']);

    const { id } = image;

    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/gallery/pictures/${id}`,
        expectedStatus: 204,
      });
    } catch (err) {
      await toastError(err, loadGalleryMessages, 'deletingError');

      return;
    }

    dispatch(gallerySetLayerDirty());

    const { imageIds, activeImageId } = getState().gallery;

    if (imageIds && activeImageId) {
      const idx = imageIds.indexOf(id);

      if (idx !== -1) {
        const newImageIds = imageIds.filter((imgId) => imgId !== id);

        dispatch(gallerySetImageIds(newImageIds));

        if (!newImageIds.length) {
          dispatch(galleryClear());
        } else if (activeImageId === id) {
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
