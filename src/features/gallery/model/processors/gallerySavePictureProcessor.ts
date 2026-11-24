import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { tagsToWire } from '../../tagRefs.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySavePicture,
  gallerySetLayerDirty,
  gallerySetSavedRotation,
} from '../actions.js';

// A second save in flight would rotate the photo twice.
let saving = false;

export const gallerySavePictureProcessor: Processor = {
  actionCreator: gallerySavePicture,
  async handle({ getState, dispatch, toastError }) {
    const { image, editModel, saveErrors } = getState().gallery;

    if (!image || !editModel || saveErrors.length || saving) {
      return;
    }

    saving = true;

    trackMatomo(['trackEvent', 'Gallery', 'savePhoto']);

    const { id } = image;

    try {
      await httpRequest({
        getState,
        method: 'PUT',
        url: `/gallery/pictures/${id}`,
        data: {
          ...editModel,
          ...tagsToWire(editModel.tags, getState().gallery.tags),
          title: editModel.title || null,
          description: editModel.description || null,
          position: parseCoordinates(editModel.dirtyPosition),
          dirtyPosition: undefined,
          takenAt: editModel.takenAt ? new Date(editModel.takenAt) : null,
          azimuth: editModel.azimuth ? parseFloat(editModel.azimuth) : null,
          rotation: editModel.rotation || undefined,
        },
        expectedStatus: 204,
      });
    } catch (err) {
      await toastError(err, loadGalleryMessages, 'savingError');

      return;
    } finally {
      saving = false;
    }

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );

    dispatch(gallerySetLayerDirty());

    // After the request, which drops the edit, so its rotation isn't previewed twice.
    if (getState().gallery.activeImageId === id) {
      dispatch(galleryRequestImage(id));
    }

    if (editModel.rotation && !image.pano) {
      dispatch(
        gallerySetSavedRotation({
          id,
          rotation: editModel.rotation,
          at: Date.now(),
        }),
      );
    }
  },
};
