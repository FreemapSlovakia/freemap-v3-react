import {
  galleryEditPicture,
  gallerySetTags,
  GalleryTag,
} from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';
import { assertType } from 'typescript-is';

export const galleryUploadModalProcessor: Processor = {
  actionCreator: [setActiveModal, galleryEditPicture],
  errorKey: 'gallery.tagsFetchingError',
  handle: async ({ getState, dispatch, action }) => {
    if (
      // don't load tags when canceling editing
      (isActionOf(galleryEditPicture, action) &&
        !getState().gallery.editModel) ||
      (isActionOf(setActiveModal, action) &&
        action.payload !== 'gallery-filter' &&
        action.payload !== 'gallery-upload')
    ) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/picture-tags',
      expectedStatus: 200,
    });

    dispatch(gallerySetTags(assertType<GalleryTag[]>(data)));
  },
};
