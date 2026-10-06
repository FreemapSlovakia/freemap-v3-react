import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from '@reduxjs/toolkit';
import type { MapBody } from '@shared/mapDefinitions.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import { mapIndex, mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import { createSelector } from 'reselect';
import { mapLibraryBodiesLoaded, mapLibraryLoadRetry } from '../actions.js';
import { drawnTypesSelector } from '../selectors.js';

/**
 * The maps whose bodies are wanted but not loaded, comma-joined: installed
 * ones, ones on the map and sources of offline and named maps.
 */
const missingTypesSelector = createSelector(
  (state: RootState) => state.mapLibrary.bodies,
  (state: RootState) => state.map.layersSettings,
  drawnTypesSelector,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.customLayers,
  (bodies, layersSettings, layers, cachedMaps, customLayers) =>
    mapIndex
      .filter(
        ({ type }) =>
          !bodies[type] &&
          (isLayerInstalled(layersSettings, type) ||
            layers.includes(type) ||
            cachedMaps.some((cm) => cm.sourceType === type) ||
            customLayers.some((def) => def.source === type)),
      )
      .map(({ type }) => type)
      .join(','),
);

const loading = new Set<string>();

/** Consecutive failures, which set how long until the next try. */
let failures = 0;

let retryTimer: ReturnType<typeof setTimeout> | undefined;

const RETRY_DELAYS_MS = [2_000, 10_000, 30_000, 60_000];

export const mapLibraryLoadProcessor: Processor = {
  actionCreator: [init, mapLibraryLoadRetry],
  stateChangePredicate: missingTypesSelector,
  predicatesOperation: 'OR',
  handle({ getState, dispatch }) {
    const missing = missingTypesSelector(getState());

    const types = missing
      ? missing.split(',').filter((type) => !loading.has(type))
      : [];

    if (!types.length) {
      return;
    }

    for (const type of types) {
      loading.add(type);
    }

    // Not awaited: loading a map is no reason for the progress spinner.
    void Promise.allSettled(
      types.map((type) => mapIndexById[type].load()),
    ).then((results) => {
      const bodies: Record<string, MapBody> = {};

      let failed: unknown;

      results.forEach((result, i) => {
        loading.delete(types[i]);

        if (result.status === 'fulfilled') {
          bodies[types[i]] = result.value;
        } else {
          failed = result.reason;
        }
      });

      if (Object.keys(bodies).length) {
        dispatch(mapLibraryBodiesLoaded(bodies));
      }

      if (failed === undefined) {
        failures = 0;

        return;
      }

      console.warn('Loading maps failed:', failed);

      // Only a map on screen is worth telling about, an offline map's source
      // included (`Layers` holds that map back); the rest are menu entries.
      const { cachedMaps } = getState().map;

      const layers = drawnTypesSelector(getState());

      const onScreen = new Set([
        ...layers,
        ...cachedMaps
          .filter((cm) => layers.includes(cm.type))
          .map((cm) => cm.sourceType),
      ]);

      if (types.some((type) => !bodies[type] && onScreen.has(type))) {
        dispatch(
          toastsAdd({
            id: 'mapLibrary.loadError',
            messageKey: 'general.loadError',
            messageParams: { err: failed },
            style: 'danger',
          }),
        );
      }

      scheduleRetry(dispatch);
    });
  },
};

/**
 * Tries the failed maps — bodies and catalog entries — again after a backoff,
 * or as soon as the network returns.
 */
export function scheduleRetry(dispatch: Dispatch) {
  if (retryTimer !== undefined) {
    return;
  }

  const retry = () => {
    clearTimeout(retryTimer);

    retryTimer = undefined;

    window.removeEventListener('online', retry);

    dispatch(mapLibraryLoadRetry());
  };

  retryTimer = setTimeout(
    retry,
    RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)],
  );

  failures++;

  window.addEventListener('online', retry);
}
