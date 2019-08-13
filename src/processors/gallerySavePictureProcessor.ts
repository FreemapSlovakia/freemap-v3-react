import {
  galleryRequestImage,
  gallerySetLayerDirty,
  gallerySavePicture,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const gallerySavePictureProcessor: IProcessor = {
  actionCreator: gallerySavePicture,
  errorKey: 'gallery.savingError',
  handle: async ({ getState, dispatch }) => {
    const { image, editModel } = getState().gallery;
    if (!image || !editModel) {
      return;
    }

    const { id } = image;

    editModel.takenAt = editModel.takenAt ? new Date(editModel.takenAt) : null;

    await httpRequest({
      getState,
      method: 'PUT',
      url: `/gallery/pictures/${id}`,
      data: editModel,
      expectedStatus: 204,
    });

    dispatch(gallerySetLayerDirty());
    dispatch(galleryRequestImage(id));
  },
};
