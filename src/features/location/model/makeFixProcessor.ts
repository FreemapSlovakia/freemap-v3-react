import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import type { LatLon } from '@shared/types/common.js';
import type { Action } from 'redux';
import { type FixConsumer, fixReady } from './actions.js';

/**
 * Places something where the fix its panel asked `requestFix` for landed.
 *
 * Gated on whatever asked still being there — the panel open, the layer on: a
 * fix can take a while to arrive, and acting on one for a panel that has since
 * been closed answers a question nobody is asking any more, which for the
 * terrain service is seconds of a one-at-a-time server spent on a render nobody
 * is waiting for.
 */
export function makeFixProcessor(
  consumer: FixConsumer,
  wanted: (state: RootState) => boolean,
  place: (state: RootState, at: LatLon) => Action,
): Processor<typeof fixReady> {
  return {
    actionCreator: fixReady,
    handle: async ({ getState, dispatch, action }) => {
      const { consumer: asked, lat, lon } = action.payload;

      if (asked === consumer && wanted(getState())) {
        dispatch(place(getState(), { lat, lon }));
      }
    },
  };
}
