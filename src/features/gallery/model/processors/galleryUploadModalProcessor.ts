import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { assert } from 'typia';
import { httpRequest } from '@app/httpRequest.js';
import { galleryEditPicture, gallerySetTags, GalleryTag } from '../actions.js';

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
