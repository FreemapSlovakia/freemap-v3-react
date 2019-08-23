import {
  galleryRequestImage,
  gallerySetLayerDirty,
  gallerySavePicture,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { parseCoordinates } from 'fm3/coordinatesParser';

export const gallerySavePictureProcessor: IProcessor = {
  actionCreator: gallerySavePicture,
  errorKey: 'gallery.savingError',
  handle: async ({ getState, dispatch }) => {
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
        position: parseCoordinates(editModel.dirtyPosition),
        takenAt: editModel.takenAt ? new Date(editModel.takenAt) : null,
      },
      expectedStatus: 204,
    });

    dispatch(gallerySetLayerDirty());
    dispatch(galleryRequestImage(id));
  },
};
