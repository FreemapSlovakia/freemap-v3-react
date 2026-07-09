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
        action.payload?.type !== 'gallery-filter' &&
        action.payload?.type !== 'gallery-upload')
    ) {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/gallery/picture-tags',
      expectedStatus: 200,
    }).catch(async (err) => {
      await toastError(err, loadGalleryMessages, 'tagsFetchingError');

      return null;
    });

    if (!res) {
      return;
    }

    dispatch(gallerySetTags(z.array(GalleryTagSchema).parse(await res.json())));
  },
};
