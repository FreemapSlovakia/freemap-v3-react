import axios from 'axios';
import React from 'react';
import { createLogic } from 'redux-logic';

import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import {
  gallerySetImageIds, galleryRequestImage, gallerySetImage, galleryRemoveItem,
  galleryUpload, gallerySetLayerDirty, gallerySetItemError, gallerySetTags, galleryClear, galleryHideUploadModal,
  gallerySetUsers,
} from 'fm3/actions/galleryActions';
import { infoPointSet } from 'fm3/actions/infoPointActions';

const galleryRequestImagesByRadiusLogic = createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_REQUEST_IMAGES',
  process({ action: { payload: { lat, lon } }, getState, cancelled$, storeDispatch }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const { tag, userId, ratingFrom, ratingTo, takenAtFrom, takenAtTo, createdAtFrom, createdAtTo } = getState().gallery.filter;

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

const galleryRequestImagesByOrderLogic = createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_LIST',
  process({ action: { payload }, getState, cancelled$, storeDispatch }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const { tag, userId, ratingFrom, ratingTo, takenAtFrom, takenAtTo, createdAtFrom, createdAtTo } = getState().gallery.filter;

    axios.get(`${process.env.API_URL}/gallery/pictures`, {
      params: {
        by: 'order',
        orderBy: payload.substring(1),
        direction: payload[0] === '+' ? 'asc' : 'desc',
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

const galleryRequestImageLogic = createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_REQUEST_IMAGE',
  process({ action: { payload: id }, getState, cancelled$, storeDispatch }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    axios.get(`${process.env.API_URL}/gallery/pictures/${id}`, {
      headers: getState().auth.user ? {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      } : {},
      validateStatus: status => status === 200,
      cancelToken: source.token,
    })
      .then(({ data }) => {
        dispatch(gallerySetImage({
          ...data,
          createdAt: new Date(data.createdAt),
          takenAt: data.takenAt && new Date(data.takenAt),
          comments: data.comments.map(comment => ({ ...comment, createdAt: new Date(comment.createdAt) })),
        }));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri načítavaní fotky: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
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
  type: ['GALLERY_SHOW_UPLOAD_MODAL', 'GALLERY_SHOW_FILTER', 'GALLERY_EDIT_PICTURE'],
  transform({ getState, action }, next) {
    if (action.type === 'GALLERY_SHOW_UPLOAD_MODAL' && !getState().auth.user) {
      next(toastsAddError('Pre nahrávanie fotiek do galérie musíte byť prihlásený.'));
    } else {
      next(action);
    }
  },
  process({ action, getState }, dispatch, done) {
    // don't load tags when canceling editing
    if (action.type === 'GALLERY_EDIT_PICTURE' && !getState().gallery.editModel) {
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

const galleryFetchUsersLogic = createLogic({
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

const galleryItemUploadLogic = createLogic({
  type: ['GALLERY_UPLOAD'],
  cancelType: 'GALLERY_HIDE_UPLOAD_MODAL',
  process({ getState }, dispatch, done) {
    const { items, uploadingId } = getState().gallery;

    if (uploadingId === null) {
      dispatch(gallerySetLayerDirty());
      if (getState().gallery.items.length === 0) {
        dispatch(toastsAdd({
          collapseKey: 'gallery.upload',
          message: <span>Fotografie boli úspešne nahrané.</span>,
          timeout: 5000,
          style: 'info',
        }));
        dispatch(galleryHideUploadModal());
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

    axios.post(`${process.env.API_URL}/gallery/pictures`, formData, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 200,
    }).then(() => {
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
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_SUBMIT_COMMENT',
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

    axios.post(
      `${process.env.API_URL}/gallery/pictures/${id}/comments`,
      {
        comment: getState().gallery.comment,
      },
      {
        headers: {
          Authorization: `Bearer ${getState().auth.user.authToken}`,
        },
        validateStatus: status => status === 200,
        cancelToken: source.token,
      },
    )
      .then(() => {
        dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri pridávani komentára: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});

const gallerySubmitStarsLogic = createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_SUBMIT_STARS',
  process({ action: { payload: stars }, getState, cancelled$, storeDispatch }, dispatch, done) {
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

    axios.post(`${process.env.API_URL}/gallery/pictures/${id}/rating`, { stars }, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 204,
      cancelToken: source.token,
    })
      .then(() => {
        dispatch(galleryRequestImage(id)); // TODO only if equal to activeImageId
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri hodnotení: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});

const galleryDeletePictureLogic = createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_DELETE_PICTURE',
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

const gallerySavePictureLogic = createLogic({
  cancelType: ['SET_TOOL', 'CLEAR_MAP'],
  type: 'GALLERY_SAVE_PICTURE',
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const { image, editModel } = getState().gallery;
    if (!image || !editModel) {
      done();
      return;
    }

    const { id } = image;

    axios.put(`${process.env.API_URL}/gallery/pictures/${id}`, editModel, {
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 204,
      cancelToken: source.token,
    })
      .then(() => {
        dispatch(gallerySetLayerDirty());
        dispatch(galleryRequestImage(id));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri ukladaní: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});

export default [
  galleryRequestImagesByRadiusLogic,
  galleryRequestImagesByOrderLogic,
  galleryRequestImageLogic,
  galleryShowOnTheMapLogic,
  galleryUploadModalLogic,
  galleryItemUploadLogic,
  gallerySubmitCommentLogic,
  gallerySubmitStarsLogic,
  galleryDeletePictureLogic,
  galleryFetchUsersLogic,
  gallerySavePictureLogic,
];
