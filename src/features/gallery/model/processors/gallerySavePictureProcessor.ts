import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { parseCoordinates } from '../../../../coordinatesParser.js';
import {
  galleryRequestImage,
  gallerySavePicture,
  gallerySetLayerDirty,
} from '../actions.js';

export const gallerySavePictureProcessor: Processor = {
  actionCreator: gallerySavePicture,
  errorKey: 'gallery.savingError',
  async handle({ getState, dispatch }) {
    const { image, editModel, saveErrors } = getState().gallery;

    if (!image || !editModel || saveErrors.length) {
      return;
    }

    const { id } = image;

    await httpRequest({
      getState,
      method: 'PUT',
      url: `/gallery/pictures/${id}`,
      data: {
        ...editModel,
        title: editModel.title || null,
        description: editModel.description || null,
        position: parseCoordinates(editModel.dirtyPosition),
        dirtyPosition: undefined,
        takenAt: editModel.takenAt ? new Date(editModel.takenAt) : null,
        azimuth: editModel.azimuth ? parseFloat(editModel.azimuth) : null,
      },
      expectedStatus: 204,
    });

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
