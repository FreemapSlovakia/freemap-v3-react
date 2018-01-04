import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetUsers } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.GALLERY_SHOW_FILTER,
  process(_, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios.get(`${process.env.API_URL}/gallery/picture-users`, { validateStatus: status => status === 200 })
      .then(({ data }) => {
        dispatch(gallerySetUsers(data));
      })
      .catch((err) => {
        dispatch(toastsAddError('gallery.tagsFetchingError', err));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
