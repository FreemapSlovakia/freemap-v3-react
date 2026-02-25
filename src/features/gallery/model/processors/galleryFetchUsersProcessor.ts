import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { assert } from 'typia';
import { GalleryUser, gallerySetUsers } from '../actions.js';

export const galleryFetchUsersProcessor: Processor = {
  actionCreator: setActiveModal,
  // TODO errorKey: 'gallery.tagsFetchingError',
  async handle({ getState, dispatch, action }) {
    if (setActiveModal.match(action) && action.payload !== 'gallery-filter') {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/gallery/picture-users',
      expectedStatus: 200,
    });

    dispatch(gallerySetUsers(assert<GalleryUser[]>(await res.json())));
  },
};
