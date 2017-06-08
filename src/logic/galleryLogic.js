import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { gallerySetImages } from 'fm3/actions/galleryActions';

const galleryRequestImagesLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_REQUEST_IMAGES',
  process({ action: { payload: { lat, lon } }, getState }, dispatch, done) {
    dispatch(startProgress());

    fetch(`http://www.freemap.sk:3000/gallery/pictures?lat=${lat}&lon=${lon}&distance=${1900 / 2 ** getState().map.zoom}`)
      .then(res => res.json())
      .then((payload) => {
        dispatch(gallerySetImages(payload)); // TODO validate payload
      })
      .catch(() => {}) // TODO toast with error
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  },
});

export default [galleryRequestImagesLogic];
