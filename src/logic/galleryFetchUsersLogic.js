import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetUsers } from 'fm3/actions/galleryActions';

export default createLogic({
  type: ['GALLERY_SHOW_FILTER'],
  process(_, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios.get(`${process.env.API_URL}/gallery/picture-users`, { validateStatus: status => status === 200 })
      .then(({ data }) => {
        dispatch(gallerySetUsers(data));
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
