import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImageIds, galleryRequestImage } from 'fm3/actions/galleryActions';

export default createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_REQUEST_IMAGES',
  process({
    action: { payload: { lat, lon } }, getState, cancelled$, storeDispatch,
  }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const {
      tag, userId, ratingFrom, ratingTo, takenAtFrom, takenAtTo, createdAtFrom, createdAtTo,
    } = getState().gallery.filter;

    axios.get(`${process.env.API_URL}/gallery/pictures`, {
      params: {
        by: 'radius',
        lat,
        lon,
        distance: 5000 / 2 ** getState().map.zoom,
        tag,
        userId,
        ratingFrom,
        ratingTo,
        takenAtFrom: takenAtFrom && takenAtFrom.toISOString(),
        takenAtTo: takenAtTo && takenAtTo.toISOString(),
        createdAtFrom: createdAtFrom && createdAtFrom.toISOString(),
        createdAtTo: createdAtTo && createdAtTo.toISOString(),
      },
      validateStatus: status => status === 200,
      cancelToken: source.token,
    })
      .then(({ data }) => {
        const ids = data.map(item => item.id);
        dispatch(gallerySetImageIds(ids));
        if (ids.length) {
          dispatch(galleryRequestImage(ids[0]));
        }
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní fotiek: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
