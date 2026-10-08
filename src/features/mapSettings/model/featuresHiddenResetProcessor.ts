import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapSetFeaturesHidden } from '@features/map/model/actions.js';
import { anyMapFeature } from '../mapFeatureCounts.js';

// Removing the last of them leaves nothing the hiding is for. On the change
// only: what has no row (a recording, a search preview) may be hidden alone.
export const featuresHiddenResetProcessor: Processor = {
  statePredicate: (state) => state.map.featuresHidden,
  stateChangePredicate: anyMapFeature,
  handle: ({ getState, dispatch }) => {
    if (!anyMapFeature(getState())) {
      dispatch(mapSetFeaturesHidden(false));
    }
  },
};
