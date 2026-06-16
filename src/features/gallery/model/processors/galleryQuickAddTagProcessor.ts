import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryQuickAddTag,
  galleryQuickChangePremium,
  galleryRequestImage,
  gallerySetLayerDirty,
} from '../actions.js';

export const galleryQuickAddTagProcessor: Processor<
  typeof galleryQuickAddTag | typeof galleryQuickChangePremium
> = {
  actionCreator: [galleryQuickAddTag, galleryQuickChangePremium],
  async handle({ getState, dispatch, action, toastError }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const { id } = image;

    try {
      await httpRequest({
        getState,
        method: 'PUT',
        url: `/gallery/pictures/${id}`,
        data: {
          title: image.title,
          description: image.description,
          tags:
            galleryQuickAddTag.type === action.type
              ? [...image.tags, action.payload]
              : image.tags,
          premium:
            galleryQuickChangePremium.type === action.type
              ? action.payload
              : Boolean(image.premium),
          takenAt: image.takenAt?.toISOString() ?? null,
          position: { lat: image.lat, lon: image.lon },
        },
        expectedStatus: 204,
      });
    } catch (err) {
      await toastError(err, loadGalleryMessages, 'savingError');

      return;
    }

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );

    dispatch(gallerySetLayerDirty());

    dispatch(galleryRequestImage(id));
  },
};
