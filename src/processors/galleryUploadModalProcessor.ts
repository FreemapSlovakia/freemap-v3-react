import { toastsAddError } from 'fm3/actions/toastsActions';
import {
  gallerySetTags,
  galleryShowUploadModal,
  galleryShowFilter,
  galleryEditPicture,
} from 'fm3/actions/galleryActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';
import { httpRequest } from 'fm3/authAxios';

export const galleryUploadModalTransformer: Processor = {
  actionCreator: galleryShowUploadModal,
  transform: ({ getState, action }) => {
    return getState().auth.user
      ? action
      : toastsAddError('gallery.unauthenticatedError');
  },
};

export const galleryUploadModalProcessor: Processor = {
  actionCreator: [
    galleryShowUploadModal,
    galleryShowFilter,
    galleryEditPicture,
  ],
  errorKey: 'gallery.tagsFetchingError',
  handle: async ({ getState, dispatch, action }) => {
    // don't load tags when canceling editing
    if (
      isActionOf(galleryEditPicture, action) &&
      !getState().gallery.editModel
    ) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/gallery/picture-tags',
      expectedStatus: 200,
    });

    dispatch(gallerySetTags(data));
  },
};
