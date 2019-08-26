import {
  gallerySetUsers,
  galleryShowFilter,
  IGalleryUser,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';

export const galleryFetchUsersProcessor: IProcessor = {
  actionCreator: galleryShowFilter,
  errorKey: 'gallery.tagsFetchingError',
  handle: async ({ getState, dispatch }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/picture-users',
      expectedStatus: 200,
    });

    dispatch(gallerySetUsers(assertType<IGalleryUser[]>(data)));
  },
};
