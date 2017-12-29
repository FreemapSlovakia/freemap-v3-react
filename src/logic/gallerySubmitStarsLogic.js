import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { galleryRequestImage } from 'fm3/actions/galleryActions';

export default createLogic({
  type: 'GALLERY_SUBMIT_STARS',
  process({
    action: { payload: stars }, getState, cancelled$, storeDispatch,
  }, dispatch, done) {
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

    axios.post(`${process.env.API_URL}/gallery/pictures/${id}/rating`, { stars }, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 204,
      cancelToken: source.token,
    })
      .then(() => {
        dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri hodnotení: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
