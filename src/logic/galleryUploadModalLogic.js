import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetTags } from 'fm3/actions/galleryActions';

export default createLogic({
  type: [at.GALLERY_SHOW_UPLOAD_MODAL, at.GALLERY_SHOW_FILTER, at.GALLERY_EDIT_PICTURE],
  transform({ getState, action }, next) {
    if (action.type === at.GALLERY_SHOW_UPLOAD_MODAL && !getState().auth.user) {
      next(toastsAddError('Pre nahrávanie fotiek do galérie musíte byť prihlásený.'));
    } else {
      next(action);
    }
  },
  process({ action, getState }, dispatch, done) {
    // don't load tags when canceling editing
    if (action.type === at.GALLERY_EDIT_PICTURE && !getState().gallery.editModel) {
      done();
      return;
    }

    const pid = Math.random();
    dispatch(startProgress(pid));

    axios.get(`${process.env.API_URL}/gallery/picture-tags`, { validateStatus: status => status === 200 })
      .then(({ data }) => {
        dispatch(gallerySetTags(data));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní tagov: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
