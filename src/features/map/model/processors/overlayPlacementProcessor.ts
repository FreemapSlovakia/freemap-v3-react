import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { overlayStackSelector } from '@features/mapLibrary/model/selectors.js';
import { mapRefocus, mapToggleLayer } from '../actions.js';

/**
 * Moves an overlay just turned on from the top to its own place among those
 * on: by its default `zIndex`, which the reducer can't read, the library maps'
 * bodies living in their own slice.
 */
export const overlayPlacementProcessor: Processor<typeof mapToggleLayer> = {
  actionCreator: mapToggleLayer,
  handle({ action, prevState, getState, dispatch }) {
    const { type } = action.payload;

    const { layers } = getState().map;

    if (prevState.map.layers.includes(type) || !layers.includes(type)) {
      return;
    }

    // Top first, the new one slotted in by its z-index among the others.
    const { stack } = overlayStackSelector({
      ...getState(),
      map: { ...getState().map, layers: prevState.map.layers },
    });

    const at = stack.indexOf(type);

    // A base map, or an overlay whose body is still loading, stays put.
    if (at === -1) {
      return;
    }

    const above = stack.slice(0, at).filter((t) => layers.includes(t));

    // The lowest of those above it on the map; it goes right under that one.
    const under = above.at(-1);

    if (under === undefined) {
      return;
    }

    const rest = layers.filter((t) => t !== type);

    rest.splice(rest.indexOf(under), 0, type);

    dispatch(mapRefocus({ layers: rest }));
  },
};
