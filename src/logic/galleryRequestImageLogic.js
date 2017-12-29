import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImage } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.GALLERY_REQUEST_IMAGE,
  cancelType: at.CLEAR_MAP,
  process({
    action: { payload: id }, getState, cancelled$, storeDispatch,
  }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    axios.get(`${process.env.API_URL}/gallery/pictures/${id}`, {
      headers: getState().auth.user ? {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      } : {},
      validateStatus: status => status === 200,
      cancelToken: source.token,
    })
      .then(({ data }) => {
        dispatch(gallerySetImage({
          ...data,
          createdAt: new Date(data.createdAt),
          takenAt: data.takenAt && new Date(data.takenAt),
          comments: data.comments.map(comment => ({ ...comment, createdAt: new Date(comment.createdAt) })),
        }));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní fotky: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
