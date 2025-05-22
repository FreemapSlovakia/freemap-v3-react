import { assert } from 'typia';
import {
  galleryEditPicture,
  gallerySetTags,
  GalleryTag,
} from '../actions/galleryActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
