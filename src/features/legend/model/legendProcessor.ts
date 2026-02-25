import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';

export const legendProcessor: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    if (action.payload === 'legend' && getState().map.layers.includes('O')) {
      window.open(
        'https://wiki.openstreetmap.org/wiki/Standard_tile_layer/Key',
      );

      return null;
    }

    return action;
  },
};
