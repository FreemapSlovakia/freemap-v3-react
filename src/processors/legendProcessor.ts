import { setActiveModal } from '../actions/mainActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
