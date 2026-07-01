import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { fitMapToBbox } from '../../fitMapToBbox.js';
import { mapFitBbox } from '../actions.js';

export const mapFitBboxProcessor: Processor<typeof mapFitBbox> = {
  actionCreator: mapFitBbox,
  handle: async ({ action }) => {
    const { bbox, maxZoom } = action.payload;

    await fitMapToBbox(bbox, maxZoom === undefined ? undefined : { maxZoom });
  },
};
