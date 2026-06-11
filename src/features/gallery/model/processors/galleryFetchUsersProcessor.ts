import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import z from 'zod';
import { GalleryUserSchema, gallerySetUsers } from '../actions.js';

export const galleryFetchUsersProcessor: Processor = {
  actionCreator: setActiveModal,
  // TODO error handling (resolve via loadGalleryMessages)
  async handle({ getState, dispatch, action }) {
    if (setActiveModal.match(action) && action.payload !== 'gallery-filter') {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/gallery/picture-users',
      expectedStatus: 200,
    });

    dispatch(
      gallerySetUsers(z.array(GalleryUserSchema).parse(await res.json())),
    );
  },
};
