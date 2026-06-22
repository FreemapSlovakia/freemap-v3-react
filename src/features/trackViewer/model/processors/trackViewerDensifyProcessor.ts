import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackViewerSetElevation } from '../actions.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

/**
 * Densifies after a server elevation override (which dispatches
 * `trackViewerSetElevation`) so the on-map colorize and the details panel —
 * which can't await — pick up the smoother profile. The chart paths call
 * `ensureRenderGeojson` themselves so they can await it before rendering.
 */
export const trackViewerDensifyProcessor: Processor<
  typeof trackViewerSetElevation
> = {
  actionCreator: trackViewerSetElevation,
  handle: async ({ getState, dispatch }) => {
    await ensureRenderGeojson(getState, dispatch);
  },
};
