import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import { fixReady } from '@features/location/model/actions.js';
import { panoramaPick } from '../actions.js';

/**
 * The fix the panel asked `requestFix` for: stand there, and render — unless the
 * panel has since been closed, where the render would be seconds of a
 * one-at-a-time server spent on a picture nobody is waiting for.
 */
export const panoramaFixProcessor: Processor<typeof fixReady> = {
  actionCreator: fixReady,
  handle: async ({ getState, dispatch, action }) => {
    const { consumer, lat, lon } = action.payload;

    if (consumer === 'panorama' && isToolOpen(getState(), 'panorama')) {
      dispatch(panoramaPick({ lat, lon }));
    }
  },
};
