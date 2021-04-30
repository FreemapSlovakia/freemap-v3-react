import {
  galleryClear,
  galleryDeletePicture,
  galleryRequestImage,
  gallerySetImageIds,
  gallerySetLayerDirty,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const galleryDeletePictureProcessor: Processor = {
  actionCreator: galleryDeletePicture,
  errorKey: 'gallery.deletingError',
  async handle({ getState, dispatch }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const { id } = image;

    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/gallery/pictures/${id}`,
      expectedStatus: 204,
    });

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
            newImageIds.length > idx
              ? newImageIds[idx]
              : newImageIds[newImageIds.length - 1];
          dispatch(galleryRequestImage(newActiveImageId));
        }
      }
    } else if (activeImageId === id) {
      dispatch(galleryClear());
    }
  },
};
