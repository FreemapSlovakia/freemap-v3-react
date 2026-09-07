import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
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
function tileTemplates(state: RootState): string[] {
  return [...integratedLayerDefs, ...state.map.customLayers]
    .filter((def) => def.technology === 'tile')
    .map((def) => def.url);
}

/** Hands the service worker the settings and the layer set it works from. */
export async function syncBrowseCache(state: RootState): Promise<void> {
  await writeBrowseCacheConfig(state.cachedMapsSettings);

  await writeBrowseTileTemplates(tileTemplates(state));

  notifyServiceWorker('browse-cache-changed');
}

export const browseCacheSettingsProcessor: Processor = {
  stateChangePredicate: (state) => state.cachedMapsSettings,
  handle: async ({ getState }) => {
    await syncBrowseCache(getState());
  },
};

export const browseCacheLayersProcessor: Processor = {
  stateChangePredicate: (state) => state.map.customLayers,
  handle: async ({ getState }) => {
    await syncBrowseCache(getState());
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
