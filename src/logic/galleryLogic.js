import { createLogic } from 'redux-logic';

import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImages, galleryRemoveItem, galleryUpload, galleryUploadFinished, gallerySetItemError, gallerySetTags } from 'fm3/actions/galleryActions';
import { infoPointSet } from 'fm3/actions/infoPointActions';
import { API_URL } from 'fm3/backendDefinitions';

const galleryRequestImagesLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_REQUEST_IMAGES',
  process({ action: { payload: { lat, lon } }, getState, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    fetch(`${API_URL}/gallery/pictures?by=radius&lat=${lat}&lon=${lon}&distance=${5000 / 2 ** getState().map.zoom}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((payload) => {
        dispatch(gallerySetImages(payload.map(item => toImage(item))));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní fotiek: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

const galleryRequestImageLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_REQUEST_IMAGE',
  process({ action: { payload: id }, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    fetch(`${API_URL}/gallery/picture/${id}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((payload) => {
        dispatch(gallerySetImages([toImage(payload)]));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní fotky: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

const galleryShowOnTheMapLogic = createLogic({
  type: 'GALLERY_SHOW_ON_THE_MAP',
  process({ getState }, dispatch, done) {
    const { images, activeImageId } = getState().gallery;
    const activeImage = activeImageId ? images.find(({ id }) => id === activeImageId) : null;
    if (activeImage) {
      dispatch(infoPointSet(activeImage.lat, activeImage.lon, activeImage.title));
      dispatch(mapRefocus({ lat: activeImage.lat, lon: activeImage.lon }));
    }
    done();
  },
});

const galleryUploadModalLogic = createLogic({
  type: 'SET_ACTIVE_MODAL',
  transform({ getState, action }, next) {
    if (action.payload === 'gallery-upload' && !getState().auth.user) {
      next(toastsAddError('Pre nahrávanie fotiek do galérie musíte byť prihlásený.'));
    } else {
      next(action);
    }
  },
  process({ action }, dispatch, done) {
    if (action.payload === 'gallery-upload') {
      const pid = Math.random();
      dispatch(startProgress(pid));

      fetch(`${API_URL}/gallery/picture-tags`)
        .then((res) => {
          if (res.status !== 200) {
            throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
          } else {
            return res.json();
          }
        })
        .then((payload) => {
          dispatch(gallerySetTags(payload));
        })
        .catch((e) => {
          dispatch(toastsAddError(`Nastala chyba pri načítavaní tagov: ${e.message}`));
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    } else {
      done();
    }
  },
});

const galleryItemUploadLogic = createLogic({
  type: ['GALLERY_UPLOAD'],
  cancelType: 'SET_ACTIVE_MODAL',
  process({ getState }, dispatch, done) {
    const { items, uploadingId } = getState().gallery;

    if (uploadingId === null) {
      dispatch(galleryUploadFinished());
      if (getState().gallery.items.length === 0) {
        dispatch(setActiveModal(null));
      }
      done();
      return;
    }

    const item = items.find(({ id }) => id === uploadingId);

    const formData = new FormData();
    formData.append('image', item.file);
    formData.append('meta', JSON.stringify({
      title: item.title,
      description: item.description,
      position: item.position,
      takenAt: item.takenAt && item.takenAt.toISOString(),
      tags: item.tags,
    }));

    fetch(`${API_URL}/gallery/picture`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      body: formData,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
      } else {
        dispatch(galleryRemoveItem(item.id));
        dispatch(galleryUpload());
      }
    }).catch((err) => {
      dispatch(gallerySetItemError(item.id, err.message));
      dispatch(galleryUpload());
    }).then(() => {
      done();
    });
  },
});

function toImage(payload) {
  return {
    // TODO validate payload
    ...payload,
    createdAt: new Date(payload.createdAt),
    takenAt: payload.takenAt && new Date(payload.takenAt),
  };
}

export default [galleryRequestImagesLogic, galleryRequestImageLogic, galleryShowOnTheMapLogic,
  galleryUploadModalLogic, galleryItemUploadLogic];
