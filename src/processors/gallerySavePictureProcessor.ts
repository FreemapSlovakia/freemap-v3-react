import {
  galleryRequestImage,
  gallerySavePicture,
  gallerySetLayerDirty,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
        takenAt: editModel.takenAt ? new Date(editModel.takenAt) : null,
      },
      expectedStatus: 204,
    });

    dispatch(gallerySetLayerDirty());

    dispatch(galleryRequestImage(id));
  },
};
