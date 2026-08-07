import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { fitMapToBbox } from '../../fitMapToBbox.js';
import { mapFitBbox } from '../actions.js';

export const mapFitBboxProcessor: Processor<typeof mapFitBbox> = {
  actionCreator: mapFitBbox,
  handle: async ({ action, dispatch }) => {
    const { bbox, maxZoom } = action.payload;

    await fitMapToBbox(
      dispatch,
      bbox,
      maxZoom === undefined ? undefined : { maxZoom },
    );
  },
};
