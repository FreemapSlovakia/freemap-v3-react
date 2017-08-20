import { createLogic } from 'redux-logic';

import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { gallerySetImageIds, galleryRequestImage, gallerySetImage, galleryRemoveItem,
  galleryUpload, gallerySetLayerDirty, gallerySetItemError, gallerySetTags, galleryClear } from 'fm3/actions/galleryActions';
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
        }
        return res.json();
      })
      .then((payload) => {
        const ids = payload.map(item => item.id);
        dispatch(gallerySetImageIds(ids));
        if (ids.length) {
          dispatch(galleryRequestImage(ids[0]));
        }
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
  process({ action: { payload: id }, getState, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    fetch(`${API_URL}/gallery/pictures/${id}`, {
      headers: getState().auth.user ? {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      } : {},
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        dispatch(gallerySetImage({
          ...payload,
          createdAt: new Date(payload.createdAt),
          takenAt: payload.takenAt && new Date(payload.takenAt),
          comments: payload.comments.map(comment => ({ ...comment, createdAt: new Date(comment.createdAt) })),
        }));
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
    const { image } = getState().gallery;
    if (image) {
      dispatch(infoPointSet(image.lat, image.lon, image.title));
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
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
          }
          return res.json();
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
      dispatch(gallerySetLayerDirty());
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

    fetch(`${API_URL}/gallery/pictures`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      body: formData,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
      }
      dispatch(galleryRemoveItem(item.id));
      dispatch(galleryUpload());
    }).catch((err) => {
      dispatch(gallerySetItemError(item.id, err.message));
      dispatch(galleryUpload());
    }).then(() => {
      done();
    });
  },
});

const gallerySubmitCommentLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_SUBMIT_COMMENT',
  process({ getState, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    const image = getState().gallery.image;
    if (!image) {
      done();
      return;
    }

    const { id } = image;

    fetch(`${API_URL}/gallery/pictures/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      body: JSON.stringify({
        comment: getState().gallery.comment,
      }),
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri pridávani komentára: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

const gallerySubmitStarsLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_SUBMIT_STARS',
  process({ action: { payload: stars }, getState, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    const image = getState().gallery.image;
    if (!image) {
      done();
      return;
    }

    const { id } = image;

    fetch(`${API_URL}/gallery/pictures/${id}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      body: JSON.stringify({
        stars,
      }),
    })
      .then((res) => {
        if (res.status !== 204) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        }
        dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri hodnotení: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

const galleryDeletePictureLogic = createLogic({
  cancelType: ['SET_TOOL', 'MAP_RESET'],
  type: 'GALLERY_DELETE_PICTURE',
  process({ getState, cancelled$ }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    const image = getState().gallery.image;
    if (!image) {
      done();
      return;
    }

    fetch(`${API_URL}/gallery/pictures/${image.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
    })
      .then((res) => {
        if (res.status !== 204) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        }
        dispatch(gallerySetLayerDirty());
        dispatch(galleryClear());
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri hodnotení: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

export default [
  galleryRequestImagesLogic,
  galleryRequestImageLogic,
  galleryShowOnTheMapLogic,
  galleryUploadModalLogic,
  galleryItemUploadLogic,
  gallerySubmitCommentLogic,
  gallerySubmitStarsLogic,
  galleryDeletePictureLogic,
];
