import { setActiveModal } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const legendProcessor: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    if (action.payload === 'legend' && getState().map.mapType === 'O') {
      window.open(
        'https://wiki.openstreetmap.org/wiki/Standard_tile_layer/Key',
      );

      return null;
    }

    return action;
  },
};
