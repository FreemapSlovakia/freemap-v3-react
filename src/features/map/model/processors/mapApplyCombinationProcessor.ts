import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { mapApplyCombination, mapRefocus, mapSetShading } from '../actions.js';
import {
  applyCombinationToLayers,
  resolveCombination,
} from '../mapCombination.js';
import {
  activeCombinationsSelector,
  layerKindsSelector,
} from '../selectors.js';

export const mapApplyCombinationProcessor: Processor<
  typeof mapApplyCombination
> = {
  actionCreator: mapApplyCombination,
  handle: async ({ dispatch, getState, action }) => {
    const state = getState();

    const { id, toggle, replaces } = action.payload;

    const combination = state.map.mapCombinations.find((c) => c.id === id);

    const resolved =
      combination && resolveCombination(combination, layerKindsSelector(state));

    if (!resolved) {
      return;
    }

    const { layers, off } = applyCombinationToLayers(
      state.map.layers,
      resolved,
      activeCombinationsSelector(state),
      { toggle, replaces },
    );

    if (!off) {
      trackMatomo(['trackEvent', 'Map', 'applyCombination']);

      // Before the layers, so what reacts to them sees the final state once.
      if (resolved.shading) {
        dispatch(mapSetShading(resolved.shading));
      }
    }

    // Through `mapRefocus`, as a link's layers are, so what reacts to a layer
    // set changing sees this one too.
    dispatch(mapRefocus({ layers }));
  },
};
