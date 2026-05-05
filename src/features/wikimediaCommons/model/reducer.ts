import { createReducer } from '@reduxjs/toolkit';
import {
  WikimediaCommonsPhoto,
  WikimediaCommonsPreview,
  wikimediaCommonsLoadPreview,
  wikimediaCommonsSetPhotos,
  wikimediaCommonsSetPreview,
} from './actions.js';

export interface WikimediaCommonsState {
  photos: WikimediaCommonsPhoto[];
  preview: WikimediaCommonsPreview | null;
  loading: number | null;
}

const initialState: WikimediaCommonsState = {
  photos: [],
  preview: null,
  loading: null,
};

export const wikimediaCommonsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(wikimediaCommonsSetPhotos, (state, { payload }) => {
      state.photos = payload;
    })
    .addCase(wikimediaCommonsLoadPreview, (state, { payload }) => {
      state.loading = payload;
      state.preview = null;
    })
    .addCase(wikimediaCommonsSetPreview, (state, { payload }) => {
      state.loading = null;
      state.preview = payload;
    }),
);
