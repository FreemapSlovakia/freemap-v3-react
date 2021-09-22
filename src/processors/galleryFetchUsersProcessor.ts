import { gallerySetUsers, GalleryUser } from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';
import { assertType } from 'typescript-is';

export const galleryFetchUsersProcessor: Processor = {
  actionCreator: setActiveModal,
  errorKey: 'gallery.tagsFetchingError',
  async handle({ getState, dispatch, action }) {
    if (
      isActionOf(setActiveModal, action) &&
      action.payload !== 'gallery-filter'
    ) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/picture-users',
      expectedStatus: 200,
    });

    dispatch(gallerySetUsers(assertType<GalleryUser[]>(data)));
  },
};
