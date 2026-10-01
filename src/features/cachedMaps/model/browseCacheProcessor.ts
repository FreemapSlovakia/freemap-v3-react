import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { integratedLayerDefsSelector } from '@features/mapLibrary/model/selectors.js';
import { createSelector } from 'reselect';
import {
  clearBrowseCache,
  readBrowseCacheStats,
  writeBrowseCacheConfig,
  writeBrowseTileTemplates,
} from '../browseCache.js';
import { notifyServiceWorker } from '../notifyServiceWorker.js';
import { browseCacheCleared, browseCacheStatsLoaded } from './actions.js';

/**
 * The URL templates the service worker recognizes as map tiles. Only plain tile
 * layers: a WMS asks for a rendered extent rather than a tile of a fixed grid,
 * and the downloaded offline maps have their own cache and their own path.
 */
const tileTemplatesSelector = createSelector(
  integratedLayerDefsSelector,
  (state: RootState) => state.map.customLayers,
  (integrated, customLayers): string[] =>
    [...integrated, ...customLayers]
      .filter((def) => def.technology === 'tile')
      .map((def) => def.url),
);

const tileTemplatesKey = createSelector(tileTemplatesSelector, (templates) =>
  templates.join('\n'),
);

let syncing = Promise.resolve();

/**
 * Hands the service worker the settings and the layer set it works from. Calls
 * are queued and each reads the state at its turn, so the last write is the latest.
 */
export function syncBrowseCache(getState: () => RootState): Promise<void> {
  syncing = syncing
    .catch(() => undefined)
    .then(async () => {
      const state = getState();

      await writeBrowseCacheConfig(state.cachedMapsSettings);

      await writeBrowseTileTemplates(tileTemplatesSelector(state));

      notifyServiceWorker('browse-cache-changed');
    });

  return syncing;
}

export const browseCacheSettingsProcessor: Processor = {
  stateChangePredicate: (state) => state.cachedMapsSettings,
  handle: async ({ getState }) => {
    await syncBrowseCache(getState);
  },
};

export const browseCacheLayersProcessor: Processor = {
  // Library maps join as their bodies load.
  stateChangePredicate: tileTemplatesKey,
  handle: async ({ getState }) => {
    await syncBrowseCache(getState);
  },
};

export const browseCacheOpenProcessor: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  actionPredicate: (action) => action.payload?.type === 'browse-cache',
  handle: async ({ dispatch }) => {
    dispatch(browseCacheStatsLoaded(await readBrowseCacheStats()));
  },
};

export const browseCacheClearProcessor: Processor = {
  actionCreator: browseCacheCleared,
  handle: async ({ dispatch }) => {
    await clearBrowseCache();

    notifyServiceWorker('browse-cache-cleared');

    dispatch(browseCacheStatsLoaded(await readBrowseCacheStats()));
  },
};
