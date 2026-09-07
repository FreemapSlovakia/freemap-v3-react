import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { applyElevationChartFromUrl } from '@app/url/locationChangeHandler.js';
import {
  mapsDisconnect,
  mapsLoadFailed,
  mapsRestoreEnded,
} from '@features/myMaps/model/actions.js';

/**
 * Applies an `elevation-chart=drawing/N` the URL asked for but that could not be
 * resolved when it was parsed, once the lines it names exist.
 *
 * A drawn line is named in the URL by position and has no id until it is in the
 * store, and the lines can arrive by several routes — a saved map loading over
 * the network or out of the offline cache, a merge, a later `line=` parse. So
 * this waits on the lines themselves rather than on any one of the dispatches
 * that install them: whichever route ran, the retry is the same.
 */
export const elevationChartPendingTargetProcessor: Processor = {
  predicatesOperation: 'OR',
  // A load that ends without delivering is the other outcome worth reacting to:
  // it clears what the request was waiting for, and without this the request
  // would stay armed and latch onto the next line drawn by hand.
  actionCreator: [mapsLoadFailed, mapsDisconnect, mapsRestoreEnded],
  stateChangePredicate: (state) => state.drawingLines.lines,
  handle: async ({ getState, dispatch }) => {
    applyElevationChartFromUrl(getState, dispatch);
  },
};
