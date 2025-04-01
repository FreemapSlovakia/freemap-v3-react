import { gallerySetUsers, GalleryUser } from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assert } from 'typia';

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
