import { assert } from 'typia';
import { gallerySetUsers, GalleryUser } from '../actions/galleryActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const galleryFetchUsersProcessor: Processor = {
  actionCreator: setActiveModal,
  errorKey: 'gallery.tagsFetchingError',
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
