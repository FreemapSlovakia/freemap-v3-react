import type { Tool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import type { LatLon } from '@shared/types/common.js';
import type { Action } from 'redux';
import { type FixConsumer, fixReady } from './actions.js';

/**
 * Places something where the fix its panel asked `requestFix` for landed.
 *
 * Gated on the panel still being open: a fix can take a while to arrive, and
 * acting on one for a panel that has since been closed answers a question
 * nobody is asking any more — for the panorama, seconds of a one-at-a-time
 * server spent on a picture nobody is waiting for.
 */
export function makeFixProcessor(
  consumer: FixConsumer,
  tool: Tool,
  place: (state: RootState, at: LatLon) => Action,
): Processor<typeof fixReady> {
  return {
    actionCreator: fixReady,
    handle: async ({ getState, dispatch, action }) => {
      const { consumer: asked, lat, lon } = action.payload;

      if (asked === consumer && isToolOpen(getState(), tool)) {
        dispatch(place(getState(), { lat, lon }));
      }
    },
  };
}
