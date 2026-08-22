import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import { fixReady } from '@features/location/model/actions.js';
import { placeToposcopeCenter } from '../centerPoint.js';

/**
 * The fix the panel asked `requestFix` for: stand the dial there — unless the
 * panel has since been closed, where a point drawn on the map answers a
 * question nobody is asking any more.
 */
export const toposcopeFixProcessor: Processor<typeof fixReady> = {
  actionCreator: fixReady,
  handle: async ({ getState, dispatch, action }) => {
    const { consumer, lat, lon } = action.payload;

    if (
      consumer === 'toposcope-center' &&
      isToolOpen(getState(), 'toposcope')
    ) {
      dispatch(placeToposcopeCenter(getState(), { lat, lon }));
    }
  },
};
