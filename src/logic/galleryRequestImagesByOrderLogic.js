import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImageIds, galleryRequestImage } from 'fm3/actions/galleryActions';
import { createFilter } from 'fm3/galleryUtils';

export default createLogic({
  type: at.GALLERY_LIST,
  cancelType: [at.SET_TOOL, at.CLEAR_MAP],
  process({
    action: { payload }, getState, cancelled$, storeDispatch,
  }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    axios.get(`${process.env.API_URL}/gallery/pictures`, {
      params: {
        by: 'order',
        orderBy: payload.substring(1),
        direction: payload[0] === '+' ? 'asc' : 'desc',
        ...createFilter(getState().gallery.filter),
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
      .catch((err) => {
        dispatch(toastsAddError('gallery.picturesFetchingError', err));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
