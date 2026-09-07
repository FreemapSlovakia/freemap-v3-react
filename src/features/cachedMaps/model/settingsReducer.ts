import { createReducer } from '@reduxjs/toolkit';
import { type BrowseCacheConfig, browseCacheDefaults } from '../browseCache.js';
import { cachedMapsSetSettings } from './actions.js';

/**
 * How tiles met while browsing are served and kept. A dedicated settings slice,
 * so the policy survives deleting the last offline map — and the service worker,
 * which can't see the store, gets its copy mirrored to IndexedDB by
 * `browseCacheProcessor`.
 */
export type CachedMapsSettingsState = BrowseCacheConfig;

export const cachedMapsSettingsInitialState: CachedMapsSettingsState =
  browseCacheDefaults;

export const cachedMapsSettingsReducer = createReducer(
  cachedMapsSettingsInitialState,
  (builder) =>
    builder.addCase(cachedMapsSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
