import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { galleryRequestImage } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.GALLERY_SUBMIT_COMMENT,
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const { image } = getState().gallery;
    if (!image) {
      done();
      return;
    }

    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const { id } = image;

    window.ga('send', 'event', 'Gallery', 'submitComment');

    axios
      .post(
        `${process.env.API_URL}/gallery/pictures/${id}/comments`,
        {
          comment: getState().gallery.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${getState().auth.user.authToken}`,
          },
          validateStatus: status => status === 200,
          cancelToken: source.token,
        },
      )
      .then(() => {
        dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
      })
      .catch(err => {
        dispatch(toastsAddError('gallery.commentAddingError', err));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
