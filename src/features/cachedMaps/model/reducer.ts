import { createReducer } from '@reduxjs/toolkit';
import {
  cachedMapDeleted,
  cachedMapsSetView,
  cacheTilesCancel,
  cacheTilesComplete,
  cacheTilesError,
  cacheTilesPause,
  cacheTilesProgress,
  cacheTilesResume,
  cacheTilesStart,
} from './actions.js';

export interface ActiveDownload {
  status: 'downloading' | 'paused' | 'error';
  downloaded: number;
  total: number;
  sizeBytes: number;
  error?: string;
}

export interface CachedMapsState {
  activeDownloads: Record<string, ActiveDownload>;
  view: 'list' | 'add';
}

export const cachedMapsInitialState: CachedMapsState = {
  activeDownloads: {},
  view: 'list',
};

export const cachedMapsReducer = createReducer(
  cachedMapsInitialState,
  (builder) =>
    builder
      .addCase(cacheTilesStart, (state, { payload }) => {
        state.activeDownloads[payload.id] = {
          status: 'downloading',
          downloaded: 0,
          total: payload.tileCount,
          sizeBytes: 0,
        };

        state.view = 'list';
      })
      .addCase(cacheTilesProgress, (state, { payload }) => {
        const dl = state.activeDownloads[payload.id];

        if (dl) {
          dl.downloaded = payload.downloaded;
          dl.sizeBytes = payload.sizeBytes;
        }
      })
      .addCase(cacheTilesComplete, (state, { payload }) => {
        delete state.activeDownloads[payload.id];
      })
      .addCase(cacheTilesPause, (state, { payload }) => {
        const dl = state.activeDownloads[payload.id];

        if (dl) {
          dl.status = 'paused';
        }
      })
      .addCase(cacheTilesResume, (state, { payload }) => {
        const dl = state.activeDownloads[payload.id];

        if (dl) {
          dl.status = 'downloading';
        }
      })
      .addCase(cacheTilesCancel, (state, { payload }) => {
        delete state.activeDownloads[payload.id];
      })
      .addCase(cacheTilesError, (state, { payload }) => {
        const dl = state.activeDownloads[payload.id];

        if (dl) {
          dl.status = 'error';
          dl.error = payload.error;
        }
      })
      .addCase(cachedMapDeleted, (state, { payload }) => {
        delete state.activeDownloads[payload.id];
      })
      .addCase(cachedMapsSetView, (state, action) => {
        state.view = action.payload;
      }),
);
