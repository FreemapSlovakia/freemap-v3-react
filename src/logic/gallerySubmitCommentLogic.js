import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { galleryRequestImage } from 'fm3/actions/galleryActions';

export default createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_SUBMIT_COMMENT',
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

    axios.post(
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
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri pridávani komentára: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
