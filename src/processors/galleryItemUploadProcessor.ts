import axios from 'axios';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  galleryRemoveItem,
  galleryUpload,
  gallerySetLayerDirty,
  gallerySetItemError,
  galleryHideUploadModal,
} from 'fm3/actions/galleryActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const galleryItemUploadProcessor: IProcessor = {
  actionCreator: galleryUpload,
  handle: async ({ getState, dispatch }) => {
    const { items, uploadingId } = getState().gallery;

    if (uploadingId === null) {
      dispatch(gallerySetLayerDirty());

      if (getState().gallery.items.length === 0) {
        dispatch(
          toastsAdd({
            collapseKey: 'gallery.upload',
            messageKey: 'gallery.uploadModal.success',
            timeout: 5000,
            style: 'info',
          }),
        );

        dispatch(galleryHideUploadModal());
      }
      return;
    }

    const item = items.find(({ id }) => id === uploadingId);

    if (!item) {
      return; // TODO error
    }

    const formData = new FormData();
    formData.append('image', item.file);
    formData.append(
      'meta',
      JSON.stringify({
        title: item.title,
        description: item.description,
        position: item.position,
        takenAt: item.takenAt && item.takenAt.toISOString(),
        tags: item.tags,
      }),
    );

    // TODO doesn't work (at least in Chrome)
    // formData.append('meta', new Blob([JSON.stringify({
    //   title: item.title,
    //   description: item.description,
    //   position: item.position,
    //   takenAt: item.takenAt && item.takenAt.toISOString(),
    //   tags: item.tags,
    // })], { type: 'application/json' }));

    try {
      await httpRequest({
        getState,
        method: 'POST',
        url: '/gallery/pictures',
        data: formData,
        expectedStatus: 200,
        cancelActions: [galleryHideUploadModal],
      });
      axios;

      dispatch(galleryRemoveItem(item.id));
      dispatch(galleryUpload());
    } catch (err) {
      dispatch(gallerySetItemError({ id: item.id, error: err.message }));
      dispatch(galleryUpload());
    }
  },
};
