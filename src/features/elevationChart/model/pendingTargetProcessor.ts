import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { applyElevationChartFromUrl } from '@app/url/locationChangeHandler.js';
import {
  mapsDisconnect,
  mapsLoadFailed,
  mapsRestoreEnded,
} from '@features/myMaps/model/actions.js';

/**
 * Applies an `elevation-chart=` the URL asked for but that could not be
 * resolved when it was parsed, once there is a line for it. Waits on the
 * features themselves, as they arrive by several routes (a map load, a merge,
 * a snapshot read back).
 */
export const elevationChartPendingTargetProcessor: Processor = {
  predicatesOperation: 'OR',
  // A load that ends without delivering is the other outcome worth reacting to:
  // it clears what the request was waiting for, and without this the request
  // would stay armed and latch onto the next line drawn by hand.
  actionCreator: [mapsLoadFailed, mapsDisconnect, mapsRestoreEnded],
  stateChangePredicate: (state) => state.trackViewer.trackGeojson,
  handle: async ({ getState, dispatch }) => {
    applyElevationChartFromUrl(getState, dispatch);
  },
};
