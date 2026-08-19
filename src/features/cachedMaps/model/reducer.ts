import { setActiveModal } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { BrowseCacheStats } from '../browseCache.js';
import { sameCoverage } from '../cachedTileMaps.js';
import {
  browseCacheStatsLoaded,
  cachedMapDeleted,
  cachedMapEdited,
  cachedMapsSetView,
  cacheTilesComplete,
  cacheTilesError,
  cacheTilesProgress,
  cacheTilesRestart,
  cacheTilesStart,
  cacheTilesStop,
} from './actions.js';

export interface ActiveDownload {
  status: 'downloading' | 'error';
  downloaded: number;
  total: number;
  sizeBytes: number;
  error?: string;
}

export interface CachedMapsState {
  activeDownloads: Record<string, ActiveDownload>;
  view: 'list' | 'add' | 'edit';
  /** The map the `edit` view is showing. */
  editId: string | null;
  /** What the browse cache holds; `null` until it has been read. */
  browseStats: BrowseCacheStats | null;
}

export const cachedMapsInitialState: CachedMapsState = {
  activeDownloads: {},
  view: 'list',
  editId: null,
  browseStats: null,
};

export const cachedMapsReducer = createReducer(
  cachedMapsInitialState,
  (builder) =>
    builder
      .addCase(cacheTilesStart, (state, { payload }) => {
        state.activeDownloads[payload.type] = {
          status: 'downloading',
          downloaded: 0,
          total: payload.tileCount,
          sizeBytes: 0,
        };

        state.view = 'list';
      })
      .addCase(cacheTilesProgress, (state, { payload }) => {
        const dl = state.activeDownloads[payload.type];

        if (dl) {
          dl.downloaded = payload.downloadedCount;
          dl.total = payload.tileCount;
          dl.sizeBytes = payload.sizeBytes;
        }
      })
      .addCase(cacheTilesRestart, (state, { payload }) => {
        state.activeDownloads[payload.id] = {
          status: 'downloading',
          downloaded: payload.downloaded,
          total: payload.total,
          sizeBytes: payload.sizeBytes,
        };
      })
      .addCase(cachedMapEdited, (state, { payload }) => {
        if (!sameCoverage(payload.prev, payload.next)) {
          state.activeDownloads[payload.next.type] = {
            status: 'downloading',
            // the pruning correction arrives as the first progress; until then
            // a shrunk map still carries the count of its wider self
            downloaded: Math.min(
              payload.next.downloadedCount,
              payload.next.tileCount,
            ),
            total: payload.next.tileCount,
            sizeBytes: payload.next.sizeBytes,
          };
        }

        state.view = 'list';
        state.editId = null;
      })
      .addCase(cacheTilesComplete, (state, { payload }) => {
        delete state.activeDownloads[payload.id];
      })
      .addCase(cacheTilesStop, (state, { payload }) => {
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
      .addCase(browseCacheStatsLoaded, (state, { payload }) => {
        state.browseStats = payload;
      })
      // The modal opens on the list wherever it is opened from — menu item,
      // keyboard chord or `#show=` link — rather than on the form a previous
      // visit was left in.
      .addCase(setActiveModal, (state, { payload }) => {
        if (payload?.type === 'offline-maps') {
          state.view = 'list';
          state.editId = null;
        }
      })
      .addCase(cachedMapsSetView, (state, { payload }) => {
        if (typeof payload === 'string') {
          state.view = payload;
          state.editId = null;
        } else {
          state.view = 'edit';
          state.editId = payload.edit;
        }
      }),
);
