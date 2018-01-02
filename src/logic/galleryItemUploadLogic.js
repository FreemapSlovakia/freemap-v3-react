import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { galleryRemoveItem, galleryUpload, gallerySetLayerDirty, gallerySetItemError, galleryHideUploadModal } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.GALLERY_UPLOAD,
  cancelType: at.GALLERY_HIDE_UPLOAD_MODAL,
  process({ getState }, dispatch, done) {
    const { items, uploadingId } = getState().gallery;

    if (uploadingId === null) {
      dispatch(gallerySetLayerDirty());
      if (getState().gallery.items.length === 0) {
        dispatch(toastsAdd({
          collapseKey: 'gallery.upload',
          message: 'Fotografie boli úspešne nahrané.',
          timeout: 5000,
          style: 'info',
        }));
        dispatch(galleryHideUploadModal());
      }
      done();
      return;
    }

    const item = items.find(({ id }) => id === uploadingId);

    const formData = new FormData();
    formData.append('image', item.file);
    formData.append('meta', JSON.stringify({
      title: item.title,
      description: item.description,
      position: item.position,
      takenAt: item.takenAt && item.takenAt.toISOString(),
      tags: item.tags,
    }));

    axios.post(`${process.env.API_URL}/gallery/pictures`, formData, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 200,
    }).then(() => {
      dispatch(galleryRemoveItem(item.id));
      dispatch(galleryUpload());
    }).catch((err) => {
      dispatch(gallerySetItemError(item.id, err.message));
      dispatch(galleryUpload());
    }).then(() => {
      done();
    });
  },
});
