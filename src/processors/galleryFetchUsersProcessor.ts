import {
  gallerySetUsers,
  galleryShowFilter,
  GalleryUser,
} from 'fm3/actions/galleryActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

export const galleryFetchUsersProcessor: Processor = {
  actionCreator: galleryShowFilter,
  errorKey: 'gallery.tagsFetchingError',
  async handle({ getState, dispatch }) {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/picture-users',
      expectedStatus: 200,
    });

    dispatch(gallerySetUsers(assertType<GalleryUser[]>(data)));
  },
};
