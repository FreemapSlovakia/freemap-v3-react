import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { dataViewerSetElevation } from '../actions.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

/**
 * Densifies after a server elevation override (which dispatches
 * `dataViewerSetElevation`), and again whenever the elevation settings the
 * render copy is derived from change, so the on-map colorize and the details
 * panel — which can't await — pick up the smoother profile. Both reset the
 * cache, and the chart's own refresh does nothing while the chart is closed.
 * The chart paths call `ensureRenderGeojson` themselves so they can await it
 * before rendering.
 */
export const dataViewerDensifyProcessor: Processor<
  typeof dataViewerSetElevation | typeof elevationSetSettings
> = {
  actionCreator: [dataViewerSetElevation, elevationSetSettings],
  handle: async ({ getState, dispatch }) => {
    await ensureRenderGeojson(getState, dispatch);
  },
};
