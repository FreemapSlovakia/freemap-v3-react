import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImageIds, galleryRequestImage, gallerySetLayerDirty, galleryClear } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.GALLERY_DELETE_PICTURE,
  cancelType: at.CLEAR_MAP,
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

    axios.delete(`${process.env.API_URL}/gallery/pictures/${id}`, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 204,
      cancelToken: source.token,
    })
      .then(() => {
        dispatch(gallerySetLayerDirty());

        const { imageIds, activeImageId } = getState().gallery;
        if (imageIds && activeImageId) {
          const idx = imageIds.findIndex(imgId => imgId === activeImageId);
          if (idx !== -1) {
            const newImageIds = imageIds.filter(imgId => imgId !== activeImageId);
            dispatch(gallerySetImageIds(newImageIds));
            if (!newImageIds.length) {
              dispatch(galleryClear());
            } else {
              const newActiveImageId = newImageIds.length > idx ? newImageIds[idx] : newImageIds[newImageIds.length - 1];
              dispatch(galleryRequestImage(newActiveImageId));
            }
          }
        } else if (activeImageId === id) {
          dispatch(galleryClear());
        }
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri mazaní obrázka: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
