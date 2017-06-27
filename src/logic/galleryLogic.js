import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImages } from 'fm3/actions/galleryActions';

const galleryRequestImagesLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_REQUEST_IMAGES',
  process({ action: { payload: { lat, lon } }, getState, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    fetch(`http://www.freemap.sk:3000/gallery/pictures?lat=${lat}&lon=${lon}&distance=${5000 / 2 ** getState().map.zoom}`)
      .then(res => res.json())
      .then((payload) => {
        const images = payload.map(image => ({ ...image, createdAt: new Date(image.createdAt) }));
        dispatch(gallerySetImages(images)); // TODO validate payload
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní obrázkov: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

export default [galleryRequestImagesLogic];
