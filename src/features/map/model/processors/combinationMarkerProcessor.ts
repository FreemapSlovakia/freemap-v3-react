import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';
import { createSelector } from 'reselect';
import { mapRefocus } from '../actions.js';
import { combinationMarker, isCombinationMarker } from '../mapCombination.js';

/**
 * `map.layers` without markers of combinations this user doesn't have (from
 * someone else's link, or a previous account) and of ones whose base map has
 * been left; the same array when there is nothing to drop.
 */
const prunedLayersSelector = createSelector(
  (state: RootState) => state.map.layers,
  (state: RootState) => state.map.mapCombinations,
  // An account's combinations arrive with its validation.
  (state: RootState) => Boolean(state.auth.user && !state.auth.validated),
  (layers, combinations, pending) => {
    if (pending || !layers.some(isCombinationMarker)) {
      return layers;
    }

    const pruned = layers.filter((type) => {
      if (!isCombinationMarker(type)) {
        return true;
      }

      const combination = combinations.find(
        (c) => combinationMarker(c.id) === type,
      );

      if (!combination || combination.base === undefined) {
        return Boolean(combination);
      }

      // One with a base map is left once that base map is off, however it went.
      const { base } = combination;

      return layers.some(
        (layer) =>
          layer === base ||
          layer === integratedLayerDefMap[base]?.superseededBy,
      );
    });

    return pruned.length === layers.length ? layers : pruned;
  },
);

export const combinationMarkerProcessor: Processor = {
  stateChangePredicate: prunedLayersSelector,
  handle: async ({ dispatch, getState }) => {
    const state = getState();

    const layers = prunedLayersSelector(state);

    if (layers !== state.map.layers) {
      dispatch(mapRefocus({ layers }));
    }
  },
};
