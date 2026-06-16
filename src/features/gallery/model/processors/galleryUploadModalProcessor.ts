import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import z from 'zod';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  GalleryTagSchema,
  galleryEditPicture,
  gallerySetTags,
} from '../actions.js';

export const galleryUploadModalProcessor: Processor = {
  actionCreator: [setActiveModal, galleryEditPicture],
  handle: async ({ getState, dispatch, action, toastError }) => {
    if (
      // don't load tags when canceling editing
      (galleryEditPicture.match(action) && !getState().gallery.editModel) ||
      (setActiveModal.match(action) &&
        action.payload !== 'gallery-filter' &&
        action.payload !== 'gallery-upload')
    ) {
      return;
    }

    let res;

    try {
      res = await httpRequest({
        getState,
        url: '/gallery/picture-tags',
        expectedStatus: 200,
      });
    } catch (err) {
      await toastError(err, loadGalleryMessages, 'tagsFetchingError');

      return;
    }

    dispatch(gallerySetTags(z.array(GalleryTagSchema).parse(await res.json())));
  },
};
