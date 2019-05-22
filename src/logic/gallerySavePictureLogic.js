import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { galleryRequestImage, gallerySetLayerDirty } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.GALLERY_SAVE_PICTURE,
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const { image, editModel } = getState().gallery;
    if (!image || !editModel) {
      done();
      return;
    }

    const { id } = image;

    editModel.takenAt = editModel.takenAt ? new Date(editModel.takenAt) : null;

    axios.put(`${process.env.API_URL}/gallery/pictures/${id}`, editModel, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 204,
      cancelToken: source.token,
    })
      .then(() => {
        dispatch(gallerySetLayerDirty());
        dispatch(galleryRequestImage(id));
      })
      .catch((err) => {
        dispatch(toastsAddError('gallery.savingError', err));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
