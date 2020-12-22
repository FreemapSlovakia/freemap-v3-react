import {
  galleryEditPicture,
  gallerySetTags,
  galleryShowFilter,
  galleryShowUploadModal,
  GalleryTag,
} from 'fm3/actions/galleryActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';
import { assertType } from 'typescript-is';

export const galleryUploadModalTransformer: Processor = {
  actionCreator: galleryShowUploadModal,
  transform: ({ getState, action }) => {
    return getState().auth.user
      ? action
      : toastsAdd({
          messageKey: 'gallery.unauthenticatedError',
          style: 'danger',
        });
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

    dispatch(gallerySetTags(assertType<GalleryTag[]>(data)));
  },
};
