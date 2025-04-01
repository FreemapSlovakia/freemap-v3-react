import {
  galleryEditPicture,
  gallerySetTags,
  GalleryTag,
} from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assert } from 'typia';

export const galleryUploadModalProcessor: Processor = {
  actionCreator: [setActiveModal, galleryEditPicture],
  errorKey: 'gallery.tagsFetchingError',
  handle: async ({ getState, dispatch, action }) => {
    if (
      // don't load tags when canceling editing
      (galleryEditPicture.match(action) && !getState().gallery.editModel) ||
      (setActiveModal.match(action) &&
        action.payload !== 'gallery-filter' &&
        action.payload !== 'gallery-upload')
    ) {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/gallery/picture-tags',
      expectedStatus: 200,
    });

    dispatch(gallerySetTags(assert<GalleryTag[]>(await res.json())));
  },
};
