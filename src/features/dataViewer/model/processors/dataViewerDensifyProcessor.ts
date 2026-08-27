import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { affectsElevationSmoothing } from '@features/elevationChart/model/settingsReducer.js';
import {
  dataViewerDeleteFeature,
  dataViewerExplodeTrack,
  dataViewerSetElevation,
  dataViewerSplitTrack,
} from '../actions.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

/**
 * Densifies after a server elevation override (which dispatches
 * `dataViewerSetElevation`), whenever the smoothing windows the render copy is
 * derived from change, and after a feature is deleted or cut up — each resets
 * the cache, and the on-map colorize and the details panel can't await it
 * themselves. The chart paths call `ensureRenderGeojson` so they can await it
 * before rendering.
 */
export const dataViewerDensifyProcessor: Processor<
  | typeof dataViewerSetElevation
  | typeof elevationSetSettings
  | typeof dataViewerDeleteFeature
  | typeof dataViewerSplitTrack
  | typeof dataViewerExplodeTrack
> = {
  actionCreator: [
    dataViewerSetElevation,
    elevationSetSettings,
    dataViewerDeleteFeature,
    dataViewerSplitTrack,
    dataViewerExplodeTrack,
  ],
  // Only the smoothing windows reset the cache; the steepness window is
  // measured off the drawn points, so it rebuilds nothing.
  actionPredicate: (action) =>
    !elevationSetSettings.match(action) ||
    affectsElevationSmoothing(action.payload),
  handle: async ({ getState, dispatch }) => {
    await ensureRenderGeojson(getState, dispatch);
  },
};
